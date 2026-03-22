def explain_forecast(
    ticker: str,
    current_price: float,
    forecast_price: float,
    volume_change_pct: float,
    avg_sentiment: float,
    sector: str = ""
) -> str:
    """
    Rule-based forecast explanation — no external API, no rate limits.
    """
    if current_price <= 0:
        return f"{ticker} forecast data is unavailable at this time."

    change_pct = ((forecast_price - current_price) / current_price) * 100
    change_dir = "rise" if change_pct > 0 else "fall"
    abs_change = abs(change_pct)

    sentiment_label = (
        "positive" if avg_sentiment > 0.05
        else "negative" if avg_sentiment < -0.05
        else "neutral"
    )

    # Magnitude descriptor
    if abs_change < 1:
        magnitude = "marginally"
    elif abs_change < 3:
        magnitude = "moderately"
    elif abs_change < 6:
        magnitude = "notably"
    else:
        magnitude = "significantly"

    # Volume signal
    if volume_change_pct > 20:
        vol_signal = f"with above-average trading volume ({volume_change_pct:+.0f}% vs 30-day avg) suggesting strong conviction"
    elif volume_change_pct < -20:
        vol_signal = f"though below-average volume ({volume_change_pct:+.0f}% vs 30-day avg) indicates limited participation"
    else:
        vol_signal = "with volume in line with recent averages"

    # Sentiment signal
    sentiment_note = (
        f"News sentiment is {sentiment_label}, which supports the {change_dir}ward outlook."
        if sentiment_label != "neutral"
        else "News sentiment is broadly neutral with no major catalysts identified."
    )

    sector_note = f" in the {sector} sector" if sector else ""

    return (
        f"{ticker}{sector_note} is forecast to {change_dir} {magnitude} by {abs_change:.1f}% "
        f"over the next 7 days, targeting ${forecast_price:.2f} from the current ${current_price:.2f}, "
        f"{vol_signal}. "
        f"{sentiment_note} "
        f"As with all model-based forecasts, actual results may differ — use this as one signal among many."
    )
