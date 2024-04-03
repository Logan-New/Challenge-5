// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    let cardClass = "";
    let deadline = new Date(task.deadline);
    let today = new Date();
    let deadlineDiff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

    if (deadlineDiff <= 0) {
        cardClass = "overdue";
    } else if (deadlineDiff <= 2) {
        cardClass = "near-deadline";
    }

    return `
        <div class="task-card card mb-3 ${cardClass}" id="task-${task.id}" data-task-id="${task.id}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text">Deadline: ${task.deadline}</p>
                <button type="button" class="btn btn-danger delete-task-btn">Delete</button>
            </div>
        </div>
    `;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    // Clear existing task list
    $("#todo-cards, #in-progress-cards, #done-cards").empty();
    
    // Loop through taskList and create task cards
    taskList.forEach(task => {
        let taskCard = createTaskCard(task);
        $(`#${task.status}-cards`).append(taskCard);
    });

    // Make task cards draggable
    $(".task-card").draggable({
        revert: "invalid",
        stack: ".task-card",
        cursor: "move"
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();
    
    // Get form values
    let title = $("#title").val();
    let description = $("#description").val();
    let deadline = $("#deadline").val();
    
    // Create new task object
    let newTask = {
        id: generateTaskId(),
        title: title,
        description: description,
        deadline: deadline,
        status: "todo" // Assuming new tasks are always added to the "todo" lane
    };

    // Add new task to taskList
    taskList.push(newTask);

    // Save taskList and nextId to localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));

    // Render updated task list
    renderTaskList();

    // Reset form values
    $("#title").val("");
    $("#description").val("");
    $("#deadline").val("");

    // Close modal
    $("#formModal").modal("hide");

    // Remove datepicker
    $("#deadline").datepicker("destroy");
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    let taskId = $(event.target).closest(".task-card").data("task-id");
    
    // Remove task from taskList
    taskList = taskList.filter(task => task.id !== taskId);

    // Save updated taskList to localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));

    // Render updated task list
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    let taskId = ui.draggable.data("task-id");
    let newStatus = $(event.target).closest(".lane").attr("id");

    // Update task status
    let taskIndex = taskList.findIndex(task => task.id === taskId);
    taskList[taskIndex].status = newStatus;

    // Save updated taskList to localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));

    // Render updated task list
    renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    // Initialize datepicker
    $("#deadline").datepicker();

    // Add event listener for submitting the add task form
    $("#add-task-form").submit(handleAddTask);

    // Add event listener for deleting a task
    $(document).on("click", ".delete-task-btn", handleDeleteTask);

    // Make lanes droppable
    $(".lane").droppable({
        accept: ".task-card",
        drop: handleDrop
    });
});
