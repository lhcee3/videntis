from prophet import Prophet
import pandas as pd

def run_forecast(df: pd.DataFrame, days: int = 7) -> list[dict]:
    # Prophet needs columns: ds (date), y (value)
    prophet_df = df.rename(columns={"Date": "ds", "Close": "y"})
    prophet_df["ds"] = pd.to_datetime(prophet_df["ds"])
    
    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=True,
    )
    model.fit(prophet_df)
    
    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future)
    
    # Return last 60 data points (historical + 7 forecast)
    result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(60 + days)
    result["ds"] = result["ds"].dt.strftime("%Y-%m-%d")
    result["is_forecast"] = result.index >= (len(result) - days)
    return result.to_dict(orient="records")
