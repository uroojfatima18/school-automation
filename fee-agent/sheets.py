import os
from pathlib import Path

import gspread
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials


def _get_spreadsheet() -> gspread.Spreadsheet:
    load_dotenv(Path(__file__).with_name(".env"))

    sheet_name = os.getenv("SHEET_NAME")
    if not sheet_name:
        raise RuntimeError("SHEET_NAME is missing from fee-agent/.env")
    sheet_id = os.getenv("SHEET_ID")
    if not sheet_id:
        raise RuntimeError("SHEET_ID is missing from fee-agent/.env")

    credentials = Credentials.from_service_account_file(
        str(Path(__file__).with_name("service_account.json")),
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"],
    )
    client = gspread.authorize(credentials)
    spreadsheet = client.open_by_key(sheet_id)
    if spreadsheet.title != sheet_name:
        raise RuntimeError(f"SHEET_ID does not match configured SHEET_NAME: {sheet_name}")
    return spreadsheet


def get_due_reminders() -> list[dict[str, object]]:
    fees = _get_spreadsheet().worksheet("Fees").get_all_records()

    return [
        {
            "fee_id": row.get("fee_id", ""),
            "student_name": row.get("student_name", ""),
            "to": row.get("parent_whatsapp", ""),
            "stage": row.get("stage", ""),
            "balance": row.get("balance", ""),
        }
        for row in fees
        if row.get("send_now") == "YES"
    ]


def get_summary() -> dict[str, str]:
    dashboard = _get_spreadsheet().worksheet("Dashboard").get_all_values()
    metric_keys = {
        "Fees billed (Rs.)": "billed",
        "Fees collected (Rs.)": "collected",
        "Fees pending (Rs.)": "pending",
        "Collection rate": "collection_rate",
        "Overdue balance (Rs.)": "overdue",
        "Defaulters (overdue)": "defaulters",
    }
    summary: dict[str, str] = {}
    for row in dashboard:
        if len(row) >= 2 and row[0] in metric_keys:
            summary[metric_keys[row[0]]] = row[1]

    missing_metrics = set(metric_keys.values()) - summary.keys()
    if missing_metrics:
        raise RuntimeError(
            f"Dashboard is missing required metrics: {', '.join(sorted(missing_metrics))}"
        )
    return summary


def main() -> None:
    reminders = get_due_reminders()
    print(f"Rows with send_now=YES: {len(reminders)}")
    for reminder in reminders:
        print(
            f"Fee ID: {reminder['fee_id']} | "
            f"Student: {reminder['student_name']} | "
            f"To: {reminder['to']} | "
            f"Stage: {reminder['stage']} | "
            f"Balance: {reminder['balance']}"
        )


if __name__ == "__main__":
    main()
