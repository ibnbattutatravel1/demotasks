# Questionnaire reminders - every hour
0 * * * * curl -sS "https://your-domain.com/api/cron/questionnaire-reminders?secret=YOUR_SECRET" > /var/log/taskara-cron-questionnaire.log 2>&1

# Daily due date reminder - every day at 07:00
0 7 * * * curl -sS "https://your-domain.com/api/cron/due-reminders?secret=YOUR_SECRET" > /var/log/taskara-cron-due.log 2>&1

# Weekly summary - Sundays at 20:00
0 20 * * SUN curl -sS "https://your-domain.com/api/cron/weekly-summary?secret=YOUR_SECRET" > /var/log/taskara-cron-weekly-summary.log 2>&1

# Weekly planning - Mondays at 07:00
0 7 * * MON curl -sS "https://your-domain.com/api/cron/weekly-planning?secret=YOUR_SECRET" > /var/log/taskara-cron-weekly-planning.log 2>&1