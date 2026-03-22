let tasks = [];
let taskId = 1;

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const completedCount = document.getElementById("completedCount");
const totalCount = document.getElementById("totalCount");
const completionStatus = document.getElementById('completionStatus');


function init() {
    renderTask();
    updateFooter();

    addBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            addTask();
        }
    });
}


function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === "") {
        alert("Vui lòng nhập công việc");
        taskInput.focus()
        return;
    }

    const newTask = {
        id: taskId++,
        name: taskText,
        complete: false,
    }

    tasks.push(newTask);
    taskInput.value = "";
    taskInput.focus();

    renderTask();
    updateFooter();
}

function renderTask() {
    taskList.innerHTML = "";
    if (tasks.length === 0) {
        taskList.innerHTML = `  <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-text">
            Chưa có công việc nào. Hãy thêm công việc mới!
          </div>
        </div>`;
        return;
    }

    tasks.forEach(task => {
        const taskItem = createElement(task);
        taskList.appendChild(taskItem);
    });
}


function createElement(task) {
    const taskItem = document.createElement("div");
    taskItem.className = `task-item ${task.complete ? `completed` : ` `}`;
    taskItem.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = `task-checkbox`;
    checkbox.checked = task.complete;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.name;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.textContent = "✏️ Sửa";
    editBtn.addEventListener("click", () => editTask(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "🗑️ Xóa";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(actions);

    return taskItem;

}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.complete = !task.complete;
        renderTask();
        updateFooter();
    }

}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const taskItem = document.querySelector(`[data-id = "${taskId}"]`);
    const taskTextElement = taskItem.querySelector(".task-text");
    const actions = taskItem.querySelector(".task-actions");

    taskItem.classList.add("editing");

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task-edit-input";
    editInput.value = task.name;

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn-save";
    saveBtn.textContent = "💾 Lưu"
    saveBtn.addEventListener("click", () => saveTask(taskId, editInput.value));


    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = '❌ Hủy';
    cancelBtn.addEventListener('click', () => renderTask());

    actions.innerHTML = "";
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    taskItem.insertBefore(editInput, actions);
    editInput.focus();
    editInput.select();


    editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            saveTask(taskId, editInput.value);
        } else if (e.key === "Escape") {
            renderTask();
        }
    });


}

function saveTask (taskId, taskName) {
    const trimText = taskName.trim();
        if (trimText === "") {
            alert('Tên công việc không được để trống!');
            return;
        }
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.name = trimText;
            renderTask();
            updateFooter();
        }
}

function deleteTask(taskId) {
    const task = tasks.find(t  => t.id === taskId);
    if (!task) return;
    const confirmDel = confirm("Bạn có muốn xóa công việc không");
    if (confirmDel) {
        tasks = tasks.filter(t => t.id !== taskId);
        renderTask();
        updateFooter();
    }
}

function updateFooter() {
    const total = tasks.length;
    const completeList = tasks.filter(t => t.complete).length;

    totalCount.textContent = total;
    completedCount.textContent = completeList;

    if (total > 0 && completeList === total) {
        completionStatus.innerHTML = `
             <div class="completion-badge">
                <span class="check-icon">✅</span>
                <span>Hoàn thành tất cả!</span>
            </div>
        `;
    } else {
        completionStatus.innerHTML = "";
    }
}
init();