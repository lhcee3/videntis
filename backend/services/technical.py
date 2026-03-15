import pandas as pd
import numpy as np

def compute_indicators(df: pd.DataFrame) -> dict:
    close = df["Close"]
    high = df.get("High", close)
    low = df.get("Low", close)
    volume = df.get("Volume", pd.Series([0] * len(close)))

    # RSI
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rs = gain / loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))

    # MACD
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    macd_hist = macd_line - signal_line

    # Moving averages
    ma20 = close.rolling(20).mean()
    ma50 = close.rolling(50).mean()
    ma200 = close.rolling(200).mean()

    # Bollinger Bands
    bb_mid = close.rolling(20).mean()
    bb_std = close.rolling(20).std()
    bb_upper = bb_mid + 2 * bb_std
    bb_lower = bb_mid - 2 * bb_std

    # Volume trend
    vol_ma20 = volume.rolling(20).mean()
    vol_ratio = (volume.iloc[-1] / vol_ma20.iloc[-1]) if vol_ma20.iloc[-1] else 1

    current = close.iloc[-1]
    rsi_val = round(float(rsi.iloc[-1]), 1)
    macd_val = round(float(macd_line.iloc[-1]), 3)
    signal_val = round(float(signal_line.iloc[-1]), 3)

    # Trend determination
    trend = "Bullish" if current > float(ma50.iloc[-1]) else "Bearish"
    if current > float(ma20.iloc[-1]) and current > float(ma50.iloc[-1]):
        trend = "Strong Bullish"
    elif current < float(ma20.iloc[-1]) and current < float(ma50.iloc[-1]):
        trend = "Strong Bearish"

    # Support / Resistance (simple: recent 20-day low/high)
    support = round(float(low.tail(20).min()), 2)
    resistance = round(float(high.tail(20).max()), 2)

    # Technical score (0-10)
    score = 5.0
    if rsi_val < 30: score += 1.5   # oversold = buy signal
    elif rsi_val > 70: score -= 1.5  # overbought = sell signal
    if macd_val > signal_val: score += 1.0
    else: score -= 1.0
    if current > float(ma50.iloc[-1]): score += 0.5
    if current > float(ma200.iloc[-1]): score += 0.5
    if vol_ratio > 1.5: score += 0.5
    score = round(max(0, min(10, score)), 1)

    rsi_label = "Overbought" if rsi_val > 70 else "Oversold" if rsi_val < 30 else "Neutral"
    macd_signal = "Bullish" if macd_val > signal_val else "Bearish"

    return {
        "rsi": rsi_val,
        "rsi_label": rsi_label,
        "macd": macd_val,
        "macd_signal_line": signal_val,
        "macd_histogram": round(float(macd_hist.iloc[-1]), 3),
        "macd_signal": macd_signal,
        "ma20": round(float(ma20.iloc[-1]), 2),
        "ma50": round(float(ma50.iloc[-1]), 2),
        "ma200": round(float(ma200.iloc[-1]), 2) if not pd.isna(ma200.iloc[-1]) else None,
        "bb_upper": round(float(bb_upper.iloc[-1]), 2),
        "bb_mid": round(float(bb_mid.iloc[-1]), 2),
        "bb_lower": round(float(bb_lower.iloc[-1]), 2),
        "support": support,
        "resistance": resistance,
        "trend": trend,
        "volume_ratio": round(float(vol_ratio), 2),
        "technical_score": score,
    }


def get_ohlcv(df: pd.DataFrame) -> list[dict]:
    cols = [c for c in ["Date", "Open", "High", "Low", "Close", "Volume"] if c in df.columns]
    out = df[cols].tail(90).copy()
    out["Date"] = out["Date"].astype(str)
    return out.to_dict(orient="records")
