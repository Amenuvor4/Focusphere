const Goal = require('../models/Goal');
const Task = require('../models/Task');

async function updateGoalProgress(goalId) {
  try {
    const goal = await Goal.findById(goalId);
    if (!goal) {
      console.log('Goal not found:', goalId);
      return;
    }

    if (!goal.tasks || goal.tasks.length === 0) {
      goal.progress = 0;
      await goal.save();
      return;
    }


    const tasks = await Task.find({
      _id: { $in: goal.tasks }
    });


    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;


    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;


    goal.progress = progress;
    await goal.save();

    console.log(`Goal "${goal.title}" progress updated: ${progress}% (${completedTasks}/${totalTasks} tasks completed)`);
    
    return progress;
  } catch (error) {
    console.error('Error updating goal progress:', error);
  }
}


async function updateGoalProgressForTask(taskId) {
  try {
    const goals = await Goal.find({
      tasks: taskId
    });

    for (const goal of goals) {
      await updateGoalProgress(goal._id);
    }
  } catch (error) {
    console.error('Error updating goal progress for task:', error);
  }
}


async function recalculateAllGoalProgress(userId) {
  try {
    const goals = await Goal.find({ userId });
    
    for (const goal of goals) {
      await updateGoalProgress(goal._id);
    }
    
    console.log(`Recalculated progress for ${goals.length} goals`);
  } catch (error) {
    console.error('Error recalculating all goal progress:', error);
  }
}

module.exports = {
  updateGoalProgress,
  updateGoalProgressForTask,
  recalculateAllGoalProgress
};