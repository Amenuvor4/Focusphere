const { google } = require("googleapis");

class CalendarService {
  /**
   * Initialize the Google Calendar client for a specific user
   */
  async getClient(user) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    // Handle token refresh automatically
    oauth2Client.on("tokens", async (tokens) => {
      if (tokens.access_token) {
        user.googleAccessToken = tokens.access_token;
        await user.save();
      }
    });

    return google.calendar({ version: "v3", auth: oauth2Client });
  }

  async createTaskEvent(user, task) {
    if (!user.googleRefreshToken) {
      throw new Error("User has not connected their Google Calendar");
    }

    const calendar = await this.getClient(user);

    // Use the task's actual description, fallback to a generated one if empty
    const description =
      task.description ||
      `Focusphere Task | Category: ${task.category} | Priority: ${task.priority}`;

    const event = {
      summary: task.title,
      description: description,
      start: {
        dateTime: new Date(task.due_date).toISOString(),
        timeZone: "UTC",
      },
      end: {
        // Default 30 minute duration
        dateTime: new Date(
          new Date(task.due_date).getTime() + 30 * 60000,
        ).toISOString(),
        timeZone: "UTC",
      },
      reminders: {
        useDefault: true,
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    return response.data;
  }

  async updateTaskEvent(user, task, eventId) {
    if (!user.googleRefreshToken) {
      throw new Error("User has not connected their Google Calendar");
    }

    const calendar = await this.getClient(user);

    const description =
      task.description ||
      `Focusphere Task | Category: ${task.category} | Priority: ${task.priority}`;

    const event = {
      summary: task.title,
      description: description,
      start: {
        dateTime: new Date(task.due_date).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(
          new Date(task.due_date).getTime() + 30 * 60000,
        ).toISOString(),
        timeZone: "UTC",
      },
    };

    const response = await calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      resource: event,
    });

    return response.data;
  }

  async deleteTaskEvent(user, eventId) {
    if (!user.googleRefreshToken) {
      throw new Error("User has not connected their Google Calendar");
    }

    const calendar = await this.getClient(user);

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    return { success: true };
  }

  async listEvents(user, maxResults = 10) {
    if (!user.googleRefreshToken) {
      throw new Error("User has not connected their Google Calendar");
    }

    const calendar = await this.getClient(user);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items;
  }

  /**
   * Bulk sync all unsynced tasks to Google Calendar
   */
  async syncAllTasks(user, tasks) {
    if (!user.googleRefreshToken) {
      throw new Error("User has not connected their Google Calendar");
    }

    const calendar = await this.getClient(user);
    const results = { success: 0, failed: 0, skipped: 0, errors: [] };

    // Filter for tasks with due dates that haven't been synced yet
    const syncableTasks = tasks.filter(
      (t) => t.due_date && !t.googleEventId && t.status !== "completed"
    );

    results.skipped = tasks.length - syncableTasks.length;

    for (const task of syncableTasks) {
      try {
        const description =
          task.description ||
          `Focusphere Task | Category: ${task.category} | Priority: ${task.priority}`;

        const event = {
          summary: task.title,
          description: description,
          start: {
            dateTime: new Date(task.due_date).toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: new Date(
              new Date(task.due_date).getTime() + 30 * 60000
            ).toISOString(),
            timeZone: "UTC",
          },
          reminders: {
            useDefault: true,
          },
        };

        const response = await calendar.events.insert({
          calendarId: "primary",
          resource: event,
        });

        // Store the event ID to prevent duplicate syncs
        task.googleEventId = response.data.id;
        await task.save();
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          taskId: task._id.toString(),
          taskTitle: task.title,
          error: err.message,
        });
      }
    }

    return results;
  }
}

module.exports = new CalendarService();
