import logging
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Try pandas-ta; fall back to manual calculations if not installed
try:
    import pandas_ta as ta
    _USE_PANDAS_TA = True
    logger.info("pandas-ta loaded — using optimised indicator calculations")
except ImportError:
    _USE_PANDAS_TA = False
    logger.info("pandas-ta not available — using built-in calculations")


def _safe(series, default=None):
    try:
        val = series.iloc[-1]
        return None if pd.isna(val) else float(val)
    except Exception:
        return default


def _compute_with_pandas_ta(df: pd.DataFrame) -> dict:
    close  = df["Close"]
    high   = df.get("High", close)
    low    = df.get("Low", close)
    volume = df.get("Volume", pd.Series([0] * len(close)))

    rsi_s   = ta.rsi(close, length=14)
    macd_df = ta.macd(close, fast=12, slow=26, signal=9)
    bb_df   = ta.bbands(close, length=20, std=2)
    ma20    = ta.sma(close, length=20)
    ma50    = ta.sma(close, length=50)
    ma200   = ta.sma(close, length=200)
    ema12   = ta.ema(close, length=12)
    vol_ma  = ta.sma(volume, length=20)

    rsi_val    = _safe(rsi_s, 50)
    macd_val   = _safe(macd_df["MACD_12_26_9"])   if macd_df is not None and not macd_df.empty else None
    signal_val = _safe(macd_df["MACDs_12_26_9"])  if macd_df is not None and not macd_df.empty else None
    macd_hist  = _safe(macd_df["MACDh_12_26_9"])  if macd_df is not None and not macd_df.empty else None
    bb_upper   = _safe(bb_df["BBU_20_2.0"])        if bb_df is not None and not bb_df.empty else None
    bb_mid     = _safe(bb_df["BBM_20_2.0"])        if bb_df is not None and not bb_df.empty else None
    bb_lower   = _safe(bb_df["BBL_20_2.0"])        if bb_df is not None and not bb_df.empty else None

    current    = float(close.iloc[-1])
    ma20_val   = _safe(ma20)
    ma50_val   = _safe(ma50)
    ma200_val  = _safe(ma200)
    vol_ma_val = _safe(vol_ma, 1)
    vol_ratio  = float(volume.iloc[-1]) / vol_ma_val if vol_ma_val else 1.0

    return {
        "rsi_val": rsi_val, "macd_val": macd_val, "signal_val": signal_val,
        "macd_hist": macd_hist, "bb_upper": bb_upper, "bb_mid": bb_mid, "bb_lower": bb_lower,
        "ma20": ma20_val, "ma50": ma50_val, "ma200": ma200_val,
        "current": current, "vol_ratio": vol_ratio,
        "support": round(float(low.tail(20).min()), 2),
        "resistance": round(float(high.tail(20).max()), 2),
    }


def _compute_manual(df: pd.DataFrame) -> dict:
    close  = df["Close"]
    high   = df.get("High", close)
    low    = df.get("Low", close)
    volume = df.get("Volume", pd.Series([0] * len(close)))

    delta = close.diff()
    gain  = delta.clip(lower=0).rolling(14).mean()
    loss  = (-delta.clip(upper=0)).rolling(14).mean()
    rs    = gain / loss.replace(0, np.nan)
    rsi_s = 100 - (100 / (1 + rs))

    ema12      = close.ewm(span=12, adjust=False).mean()
    ema26      = close.ewm(span=26, adjust=False).mean()
    macd_line  = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    macd_hist  = macd_line - signal_line

    ma20  = close.rolling(20).mean()
    ma50  = close.rolling(50).mean()
    ma200 = close.rolling(200).mean()
    bb_mid   = close.rolling(20).mean()
    bb_std   = close.rolling(20).std()
    bb_upper = bb_mid + 2 * bb_std
    bb_lower = bb_mid - 2 * bb_std
    vol_ma   = volume.rolling(20).mean()

    current    = float(close.iloc[-1])
    vol_ma_val = float(vol_ma.iloc[-1]) if not pd.isna(vol_ma.iloc[-1]) else 1
    vol_ratio  = float(volume.iloc[-1]) / vol_ma_val if vol_ma_val else 1.0

    return {
        "rsi_val":    _safe(rsi_s, 50),
        "macd_val":   _safe(macd_line),
        "signal_val": _safe(signal_line),
        "macd_hist":  _safe(macd_hist),
        "bb_upper":   _safe(bb_upper),
        "bb_mid":     _safe(bb_mid),
        "bb_lower":   _safe(bb_lower),
        "ma20":       _safe(ma20),
        "ma50":       _safe(ma50),
        "ma200":      _safe(ma200),
        "current":    current,
        "vol_ratio":  vol_ratio,
        "support":    round(float(low.tail(20).min()), 2),
        "resistance": round(float(high.tail(20).max()), 2),
    }


def compute_indicators(df: pd.DataFrame) -> dict:
    try:
        vals = _compute_with_pandas_ta(df) if _USE_PANDAS_TA else _compute_manual(df)
    except Exception as e:
        logger.warning(f"pandas-ta failed, falling back to manual: {e}")
        vals = _compute_manual(df)

    rsi_val    = vals["rsi_val"] or 50
    macd_val   = vals["macd_val"] or 0
    signal_val = vals["signal_val"] or 0
    current    = vals["current"]
    ma50_val   = vals["ma50"] or current
    ma200_val  = vals["ma200"]
    vol_ratio  = vals["vol_ratio"]

    trend = "Bullish" if current > ma50_val else "Bearish"
    if vals["ma20"] and current > vals["ma20"] and current > ma50_val:
        trend = "Strong Bullish"
    elif vals["ma20"] and current < vals["ma20"] and current < ma50_val:
        trend = "Strong Bearish"

    score = 5.0
    if rsi_val < 30:   score += 1.5
    elif rsi_val > 70: score -= 1.5
    if macd_val > signal_val: score += 1.0
    else:                     score -= 1.0
    if current > ma50_val:  score += 0.5
    if ma200_val and current > ma200_val: score += 0.5
    if vol_ratio > 1.5: score += 0.5
    score = round(max(0, min(10, score)), 1)

    rsi_label   = "Overbought" if rsi_val > 70 else "Oversold" if rsi_val < 30 else "Neutral"
    macd_signal = "Bullish" if macd_val > signal_val else "Bearish"

    def r(v, n=2): return round(v, n) if v is not None else None

    return {
        "rsi":              r(rsi_val, 1),
        "rsi_label":        rsi_label,
        "macd":             r(macd_val, 3),
        "macd_signal_line": r(signal_val, 3),
        "macd_histogram":   r(vals["macd_hist"], 3),
        "macd_signal":      macd_signal,
        "ma20":             r(vals["ma20"]),
        "ma50":             r(ma50_val),
        "ma200":            r(ma200_val),
        "bb_upper":         r(vals["bb_upper"]),
        "bb_mid":           r(vals["bb_mid"]),
        "bb_lower":         r(vals["bb_lower"]),
        "support":          vals["support"],
        "resistance":       vals["resistance"],
        "trend":            trend,
        "volume_ratio":     r(vol_ratio),
        "technical_score":  score,
    }


def get_ohlcv(df: pd.DataFrame) -> list:
    cols = [c for c in ["Date", "Open", "High", "Low", "Close", "Volume"] if c in df.columns]
    out = df[cols].tail(90).copy()
    out["Date"] = out["Date"].astype(str)
    return out.to_dict(orient="records")
