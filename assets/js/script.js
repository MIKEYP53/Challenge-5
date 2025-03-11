// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

const taskFormEl = $('#formModal');
const taskNameInputEl = $('#task-name-input');
const taskDateInputEl = $('#task-date-input');
const taskContentInputEl = $('#task-content-input'); 

// Generates a random id by using crypto
function generateTaskId() {
    return crypto.randomUUID();
}

// Read tasks from localStorage
function readTasksFromStorage() {
    let tasks = localStorage.getItem("tasks");
    return tasks ? JSON.parse(tasks) : [];
}

// Save tasks to localStorage
function saveTasksToStorage(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Creates the model for a tasks view on the page
function createTaskCard(task) {
    const taskCard = $('<div>')
        .addClass('card task-card draggable my-3')
        .attr('data-task-id', task.id);
    
    const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(task.content);
    const cardDueDate = $('<p>').addClass('card-text').text(task.date);
    const cardDeleteBtn = $('<button>')
        .addClass('btn btn-danger btn-delete-task')
        .text('Delete')
        .attr('data-task-id', task.id);
    
    cardDeleteBtn.on('click', handleDeleteTask);

    // Makes task that are due today yellow, and red for tasks that are past due
    if (task.date && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.date, 'DD/MM/YYYY');

       
        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text-white');
            cardDeleteBtn.addClass('border-light');
        }
    }

    // Append elements to the card
    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);

    // Return the card to be appended to the correct lane
    return taskCard;
}

// Renders the task list and makes the task draggable
function renderTaskList() {
    const tasks = readTasksFromStorage();

    // Empty existing task cards from lanes
    const todoList = $('#todo-cards');
    todoList.empty();

    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();

    const doneList = $('#done-cards');
    doneList.empty();

    // Loop through tasks and create task cards for each status
    for (let task of tasks) {
        if (task.status === 'to-do') {
            todoList.append(createTaskCard(task));
        } else if (task.status === 'in-progress') {
            inProgressList.append(createTaskCard(task));
        } else if (task.status === 'done') {
            doneList.append(createTaskCard(task));
        }
    }

    // Use JQuery UI to make task cards draggable
    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        containment: 'document', 
        helper: function (e) { // Clones the dragged task to make it visible
            const original = $(e.target).closest('.draggable');
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });
}

// Submit code that handles adding a new task
function handleAddTask(event) {
    event.preventDefault();

    // Reads user input from the form
    const taskName = taskNameInputEl.val().trim();
    const taskDate = taskDateInputEl.val();
    const taskContent = taskContentInputEl.val(); // yyyy-mm-dd format

    const newTask = {
        id: generateTaskId(), // Ensure each task has a unique ID
        name: taskName,
        date: taskDate,
        content: taskContent,
        status: 'to-do',
    };

    // Pull tasks from localStorage and add the new task to the array
    const tasks = readTasksFromStorage();
    tasks.push(newTask);

    saveTasksToStorage(tasks);

    // Print task data back to the screen
    renderTaskList();

    // Clear the form inputs
    taskNameInputEl.val('');
    taskDateInputEl.val('');
    taskContentInputEl.val('');
}

// Delete code for removing a task
function handleDeleteTask(event) {
    const taskId = $(this).attr('data-task-id');
    const tasks = readTasksFromStorage();

    // Remove task from the array
    tasks.forEach((task) => {
        if (task.id === taskId) {
            tasks.splice(tasks.indexOf(task), 1);
        }
    });

    
    saveTasksToStorage(tasks);

    // Re-render the task list
    renderTaskList();
}

// Event Handles when a task is dropped on a lane
function handleDrop(event, ui) {
    const tasks = readTasksFromStorage();

    // Get the task ID from the event
    const cardId = ui.draggable[0].dataset.taskId;

    // Get the ID of the lane that the card was dropped into
    const newStatus = event.target.id;

    for (let task of tasks) {
        if (task.id === cardId) {
            task.status = newStatus;
        }
    }

    // Save the updated tasks array to localStorage and re-render the list
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTaskList();
}

// Add event listeners for the form submission and task deletion
taskFormEl.on('submit', handleAddTask);
$('#todo-cards, #in-progress-cards, #done-cards').on('click', '.btn-delete-task', handleDeleteTask);

// loads, render the task list, add event listeners, make lanes droppable, and initialize the date picker
$(document).ready(function () {

    renderTaskList();

    // Initialize the date picker for task due date input
    $('#task-date-input').datepicker({
        changeMonth: true,
        changeYear: true,
        showAnim: "slideDown",
    });    

    // Make lanes droppable
    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });
});
