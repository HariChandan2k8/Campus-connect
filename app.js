const STORAGE_KEY = "campusConnectData";

const seedData = {
  users: [
    {
      id: "u1",
      name: "Host Admin",
      roll: "HOST001",
      email: "host@college.com",
      password: "123456",
      role: "host",
      department: "Computer Science",
      semester: "All",
      friends: ["u2", "u3"],
    },
    {
      id: "u2",
      name: "Ananya Student",
      roll: "CS001",
      email: "student@college.com",
      password: "123456",
      role: "student",
      department: "Computer Science",
      semester: "5",
      friends: ["u1", "u3"],
    },
    {
      id: "u3",
      name: "Rahul Kumar",
      roll: "CS002",
      email: "rahul@college.com",
      password: "123456",
      role: "student",
      department: "Computer Science",
      semester: "5",
      friends: ["u2"],
    },
  ],
  assignments: [
    {
      id: "a1",
      title: "DBMS ER Diagram",
      subject: "Database Management",
      dueDate: "2026-07-05",
      maxMarks: 20,
      createdBy: "u1",
    },
    {
      id: "a2",
      title: "Operating System Notes",
      subject: "Operating Systems",
      dueDate: "2026-07-09",
      maxMarks: 10,
      createdBy: "u1",
    },
  ],
  assignmentStatus: [
    { studentId: "u2", assignmentId: "a1", done: true, marks: 18 },
    { studentId: "u2", assignmentId: "a2", done: false, marks: "" },
    { studentId: "u3", assignmentId: "a1", done: false, marks: "" },
  ],
  examMarks: [
    { id: "m1", studentId: "u2", exam: "Internal 1", subject: "DBMS", marks: 42, maxMarks: 50 },
    { id: "m2", studentId: "u2", exam: "Internal 1", subject: "OS", marks: 38, maxMarks: 50 },
    { id: "m3", studentId: "u3", exam: "Internal 1", subject: "DBMS", marks: 35, maxMarks: 50 },
  ],
  notes: [
    {
      id: "n1",
      title: "DBMS Unit 1 Notes",
      subject: "DBMS",
      link: "https://example.com/dbms-notes.pdf",
      uploadedBy: "u1",
      createdAt: "2026-06-29",
    },
  ],
  posts: [
    {
      id: "p1",
      title: "Internal Exam Timetable",
      type: "exam",
      body: "Internal exams start on 15 July. Timetable will be shared subject wise.",
      createdBy: "u1",
      createdAt: "2026-06-29",
    },
  ],
  chats: [
    { id: "c1", from: "u2", to: "u3", message: "Did you finish DBMS assignment?", createdAt: "09:30" },
    { id: "c2", from: "u3", to: "u2", message: "Almost done. I will share notes.", createdAt: "09:34" },
  ],
  groups: [
    {
      id: "g1",
      name: "CS 5th Semester",
      createdBy: "u2",
      members: ["u2", "u3"],
      messages: [
        { id: "gm1", from: "u2", message: "Share exam updates here.", createdAt: "10:00" },
      ],
    },
  ],
};

let data = loadData();
let currentUser = null;
let activeView = "dashboard";
let selectedChatUserId = null;
let selectedGroupId = null;

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return structuredClone(seedData);
  }
  return JSON.parse(saved);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function uid(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 999)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function userName(id) {
  return data.users.find((user) => user.id === id)?.name || "Unknown";
}

function render() {
  if (!currentUser) {
    renderLogin();
    return;
  }
  renderApp();
}

function renderLogin(message = "") {
  document.getElementById("app").innerHTML = `
    <div class="login-wrap">
      <section class="login-panel">
        <div class="brand">
          <div class="brand-mark">CC</div>
          <div>
            <h1>Campus Connect</h1>
            <p>College marks, notes, posts, chat, and groups</p>
          </div>
        </div>
        <form class="form" id="loginForm" style="margin-top: 28px;">
          <div class="field">
            <label>Email</label>
            <input name="email" type="email" placeholder="student@college.com" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input name="password" type="password" placeholder="123456" required />
          </div>
          <button class="btn full" type="submit">Login</button>
          ${message ? `<p class="pill amber">${message}</p>` : ""}
        </form>
        <div class="demo-users">
          <strong>Demo logins</strong>
          <span>Host: host@college.com / 123456</span>
          <span>Student: student@college.com / 123456</span>
        </div>
      </section>
      <section class="login-art">
        <h2>Your class work, marks, notes, notices, and friends in one place.</h2>
      </section>
    </div>
  `;

  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get("email").trim().toLowerCase();
    const password = form.get("password");
    const user = data.users.find((item) => item.email.toLowerCase() === email && item.password === password);
    if (!user) {
      renderLogin("Wrong email or password");
      return;
    }
    currentUser = user;
    activeView = "dashboard";
    render();
  });
}

function renderApp() {
  const nav = [
    ["dashboard", "Dashboard"],
    ["assignments", "Assignments"],
    ["marks", "Exam Marks"],
    ["notes", "Notes"],
    ["posts", "Posts"],
    ["friends", "Friends"],
    ["chat", "Private Chat"],
    ["groups", "Groups"],
  ];

  document.getElementById("app").innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">CC</div>
          <div>
            <h1>Campus Connect</h1>
            <p>${currentUser.role === "host" ? "Host dashboard" : "Student dashboard"}</p>
          </div>
        </div>
        <nav class="nav">
          ${nav.map(([key, label]) => `<button class="${activeView === key ? "active" : ""}" data-view="${key}">${label}</button>`).join("")}
        </nav>
        <div class="profile">
          <strong>${currentUser.name}</strong>
          <p>${currentUser.roll} · ${currentUser.department}</p>
          <button class="btn secondary full" id="logoutBtn" style="margin-top: 12px;">Logout</button>
        </div>
      </aside>
      <section class="content">
        ${viewHeader()}
        <div id="view"></div>
      </section>
    </div>
  `;

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.view;
      render();
    });
  });
  document.getElementById("logoutBtn").addEventListener("click", () => {
    currentUser = null;
    render();
  });

  const views = {
    dashboard: renderDashboard,
    assignments: renderAssignments,
    marks: renderMarks,
    notes: renderNotes,
    posts: renderPosts,
    friends: renderFriends,
    chat: renderChat,
    groups: renderGroups,
  };
  views[activeView]();
}

function viewHeader() {
  const titles = {
    dashboard: ["Dashboard", "Quick overview of college activity."],
    assignments: ["Assignments", "Track completed work and assignment marks."],
    marks: ["Exam Marks", "View or upload examination marks."],
    notes: ["Notes", "Share notes links with students."],
    posts: ["Posts & Notifications", "Official examination and college information."],
    friends: ["Friends", "Add students by roll number."],
    chat: ["Private Chat", "Send private messages to friends."],
    groups: ["Groups", "Create groups and chat together."],
  };
  const [title, subtitle] = titles[activeView];
  return `
    <div class="topbar">
      <div>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <span class="pill">${currentUser.role.toUpperCase()}</span>
    </div>
  `;
}

function renderDashboard() {
  const studentStatuses = data.assignmentStatus.filter((item) => item.studentId === currentUser.id);
  const completed = studentStatuses.filter((item) => item.done).length;
  const pending = currentUser.role === "student" ? Math.max(data.assignments.length - completed, 0) : data.assignments.length;
  const marks = currentUser.role === "student" ? data.examMarks.filter((mark) => mark.studentId === currentUser.id) : data.examMarks;
  const notices = data.posts.slice(-3).reverse();

  document.getElementById("view").innerHTML = `
    <div class="grid">
      <article class="card stat span-3"><span class="muted">Assignments done</span><span class="value">${completed}</span></article>
      <article class="card stat span-3"><span class="muted">${currentUser.role === "student" ? "Pending work" : "Total assignments"}</span><span class="value">${pending}</span></article>
      <article class="card stat span-3"><span class="muted">Marks records</span><span class="value">${marks.length}</span></article>
      <article class="card stat span-3"><span class="muted">Friends</span><span class="value">${currentUser.friends.length}</span></article>
      <section class="card span-6">
        <div class="section-title"><h3>Latest posts</h3></div>
        <div class="list">${notices.map(postItem).join("") || `<div class="empty">No posts yet.</div>`}</div>
      </section>
      <section class="card span-6">
        <div class="section-title"><h3>Recent notes</h3></div>
        <div class="list">${data.notes.slice(-4).reverse().map(noteItem).join("") || `<div class="empty">No notes yet.</div>`}</div>
      </section>
    </div>
  `;
}

function renderAssignments() {
  const hostForm = currentUser.role === "host" ? `
    <section class="card span-4">
      <div class="section-title"><h3>Add assignment</h3></div>
      <form class="form" id="assignmentForm">
        <div class="field"><label>Title</label><input name="title" required /></div>
        <div class="field"><label>Subject</label><input name="subject" required /></div>
        <div class="field"><label>Due date</label><input name="dueDate" type="date" required /></div>
        <div class="field"><label>Max marks</label><input name="maxMarks" type="number" min="1" required /></div>
        <button class="btn" type="submit">Add Assignment</button>
      </form>
    </section>
  ` : "";

  document.getElementById("view").innerHTML = `
    <div class="grid">
      ${hostForm}
      <section class="card ${currentUser.role === "host" ? "span-8" : "span-12"}">
        <div class="section-title"><h3>Assignments</h3></div>
        <div class="list">${data.assignments.map(assignmentItem).join("") || `<div class="empty">No assignments yet.</div>`}</div>
      </section>
    </div>
  `;

  if (currentUser.role === "host") {
    document.getElementById("assignmentForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const assignment = {
        id: uid("a"),
        title: form.get("title"),
        subject: form.get("subject"),
        dueDate: form.get("dueDate"),
        maxMarks: Number(form.get("maxMarks")),
        createdBy: currentUser.id,
      };
      data.assignments.push(assignment);
      data.users.filter((user) => user.role === "student").forEach((student) => {
        data.assignmentStatus.push({ studentId: student.id, assignmentId: assignment.id, done: false, marks: "" });
      });
      saveData();
      render();
    });

    document.querySelectorAll("[data-save-mark]").forEach((button) => {
      button.addEventListener("click", () => {
        const [studentId, assignmentId] = button.dataset.saveMark.split("|");
        const input = document.querySelector(`[data-mark-input="${studentId}|${assignmentId}"]`);
        let status = data.assignmentStatus.find((item) => item.studentId === studentId && item.assignmentId === assignmentId);
        if (!status) {
          status = { studentId, assignmentId, done: false, marks: "" };
          data.assignmentStatus.push(status);
        }
        status.marks = input.value;
        saveData();
        render();
      });
    });
  } else {
    document.querySelectorAll("[data-toggle-assignment]").forEach((button) => {
      button.addEventListener("click", () => {
        const assignmentId = button.dataset.toggleAssignment;
        let status = data.assignmentStatus.find((item) => item.studentId === currentUser.id && item.assignmentId === assignmentId);
        if (!status) {
          status = { studentId: currentUser.id, assignmentId, done: false, marks: "" };
          data.assignmentStatus.push(status);
        }
        status.done = !status.done;
        saveData();
        render();
      });
    });
  }
}

function assignmentItem(assignment) {
  if (currentUser.role === "host") {
    const rows = data.users.filter((user) => user.role === "student").map((student) => {
      const status = data.assignmentStatus.find((item) => item.studentId === student.id && item.assignmentId === assignment.id) || {};
      return `
        <tr>
          <td>${student.name}<br><span class="muted">${student.roll}</span></td>
          <td>${status.done ? `<span class="pill green">Done</span>` : `<span class="pill amber">Pending</span>`}</td>
          <td><input data-mark-input="${student.id}|${assignment.id}" type="number" min="0" max="${assignment.maxMarks}" value="${status.marks ?? ""}" /></td>
          <td><button class="btn secondary" data-save-mark="${student.id}|${assignment.id}">Save</button></td>
        </tr>
      `;
    }).join("");
    return `
      <article class="item">
        <div class="item-head">
          <div><h4>${assignment.title}</h4><p>${assignment.subject} · Due ${assignment.dueDate} · ${assignment.maxMarks} marks</p></div>
          <span class="pill">Host view</span>
        </div>
        <table class="table" style="margin-top: 12px;">
          <thead><tr><th>Student</th><th>Status</th><th>Marks</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </article>
    `;
  }

  const status = data.assignmentStatus.find((item) => item.studentId === currentUser.id && item.assignmentId === assignment.id) || {};
  return `
    <article class="item">
      <div class="item-head">
        <div>
          <h4>${assignment.title}</h4>
          <p>${assignment.subject} · Due ${assignment.dueDate} · Marks: ${status.marks || "Not added"} / ${assignment.maxMarks}</p>
        </div>
        ${status.done ? `<span class="pill green">Done</span>` : `<span class="pill amber">Pending</span>`}
      </div>
      <div class="actions">
        <button class="btn ${status.done ? "secondary" : ""}" data-toggle-assignment="${assignment.id}">
          ${status.done ? "Mark Pending" : "Mark Done"}
        </button>
      </div>
    </article>
  `;
}

function renderMarks() {
  const studentOptions = data.users.filter((user) => user.role === "student").map((user) => `<option value="${user.id}">${user.name} (${user.roll})</option>`).join("");
  const hostForm = currentUser.role === "host" ? `
    <section class="card span-4">
      <div class="section-title"><h3>Add exam marks</h3></div>
      <form class="form" id="marksForm">
        <div class="field"><label>Student</label><select name="studentId">${studentOptions}</select></div>
        <div class="field"><label>Exam name</label><input name="exam" placeholder="Internal 1" required /></div>
        <div class="field"><label>Subject</label><input name="subject" required /></div>
        <div class="field"><label>Marks</label><input name="marks" type="number" min="0" required /></div>
        <div class="field"><label>Max marks</label><input name="maxMarks" type="number" min="1" required /></div>
        <button class="btn" type="submit">Save Marks</button>
      </form>
    </section>
  ` : "";

  const visibleMarks = currentUser.role === "host" ? data.examMarks : data.examMarks.filter((mark) => mark.studentId === currentUser.id);
  document.getElementById("view").innerHTML = `
    <div class="grid">
      ${hostForm}
      <section class="card ${currentUser.role === "host" ? "span-8" : "span-12"}">
        <div class="section-title"><h3>Marks list</h3></div>
        <table class="table">
          <thead><tr><th>Student</th><th>Exam</th><th>Subject</th><th>Marks</th></tr></thead>
          <tbody>
            ${visibleMarks.map((mark) => `<tr><td>${userName(mark.studentId)}</td><td>${mark.exam}</td><td>${mark.subject}</td><td>${mark.marks} / ${mark.maxMarks}</td></tr>`).join("")}
          </tbody>
        </table>
      </section>
    </div>
  `;

  if (currentUser.role === "host") {
    document.getElementById("marksForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      data.examMarks.push({
        id: uid("m"),
        studentId: form.get("studentId"),
        exam: form.get("exam"),
        subject: form.get("subject"),
        marks: Number(form.get("marks")),
        maxMarks: Number(form.get("maxMarks")),
      });
      saveData();
      render();
    });
  }
}

function renderNotes() {
  document.getElementById("view").innerHTML = `
    <div class="grid">
      <section class="card span-4">
        <div class="section-title"><h3>Share notes</h3></div>
        <form class="form" id="notesForm">
          <div class="field"><label>Title</label><input name="title" required /></div>
          <div class="field"><label>Subject</label><input name="subject" required /></div>
          <div class="field"><label>PDF or drive link</label><input name="link" type="url" placeholder="https://..." required /></div>
          <button class="btn" type="submit">Share Notes</button>
        </form>
      </section>
      <section class="card span-8">
        <div class="section-title"><h3>Shared notes</h3></div>
        <div class="list">${data.notes.slice().reverse().map(noteItem).join("") || `<div class="empty">No notes shared yet.</div>`}</div>
      </section>
    </div>
  `;
  document.getElementById("notesForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    data.notes.push({
      id: uid("n"),
      title: form.get("title"),
      subject: form.get("subject"),
      link: form.get("link"),
      uploadedBy: currentUser.id,
      createdAt: today(),
    });
    saveData();
    render();
  });
}

function noteItem(note) {
  return `
    <article class="item">
      <div class="item-head">
        <div><h4>${note.title}</h4><p>${note.subject} · Shared by ${userName(note.uploadedBy)} · ${note.createdAt}</p></div>
        <a class="btn secondary" href="${note.link}" target="_blank" rel="noreferrer">Open</a>
      </div>
    </article>
  `;
}

function renderPosts() {
  const hostForm = currentUser.role === "host" ? `
    <section class="card span-4">
      <div class="section-title"><h3>Create post</h3></div>
      <form class="form" id="postsForm">
        <div class="field"><label>Title</label><input name="title" required /></div>
        <div class="field"><label>Type</label><select name="type"><option value="exam">Exam</option><option value="notice">Notice</option><option value="general">General</option></select></div>
        <div class="field"><label>Information</label><textarea name="body" required></textarea></div>
        <button class="btn" type="submit">Post Notification</button>
      </form>
    </section>
  ` : "";

  document.getElementById("view").innerHTML = `
    <div class="grid">
      ${hostForm}
      <section class="card ${currentUser.role === "host" ? "span-8" : "span-12"}">
        <div class="section-title"><h3>Notifications</h3></div>
        <div class="list">${data.posts.slice().reverse().map(postItem).join("") || `<div class="empty">No posts yet.</div>`}</div>
      </section>
    </div>
  `;

  if (currentUser.role === "host") {
    document.getElementById("postsForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      data.posts.push({
        id: uid("p"),
        title: form.get("title"),
        type: form.get("type"),
        body: form.get("body"),
        createdBy: currentUser.id,
        createdAt: today(),
      });
      saveData();
      render();
    });
  }
}

function postItem(post) {
  return `
    <article class="item">
      <div class="item-head">
        <div><h4>${post.title}</h4><p>${post.body}</p></div>
        <span class="pill">${post.type}</span>
      </div>
      <div class="actions"><span class="muted">Posted by ${userName(post.createdBy)} on ${post.createdAt}</span></div>
    </article>
  `;
}

function renderFriends() {
  const friends = data.users.filter((user) => currentUser.friends.includes(user.id));
  document.getElementById("view").innerHTML = `
    <div class="grid">
      <section class="card span-4">
        <div class="section-title"><h3>Add friend</h3></div>
        <form class="form" id="friendForm">
          <div class="field"><label>Roll number</label><input name="roll" placeholder="CS002" required /></div>
          <button class="btn" type="submit">Add by Roll Number</button>
        </form>
      </section>
      <section class="card span-8">
        <div class="section-title"><h3>Your friends</h3></div>
        <div class="list">
          ${friends.map((friend) => `<article class="item"><h4>${friend.name}</h4><p>${friend.roll} · ${friend.department} · Semester ${friend.semester}</p></article>`).join("") || `<div class="empty">No friends added yet.</div>`}
        </div>
      </section>
    </div>
  `;
  document.getElementById("friendForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const roll = new FormData(event.currentTarget).get("roll").trim().toUpperCase();
    const friend = data.users.find((user) => user.roll.toUpperCase() === roll && user.id !== currentUser.id);
    if (!friend) {
      alert("No student found with that roll number.");
      return;
    }
    if (!currentUser.friends.includes(friend.id)) currentUser.friends.push(friend.id);
    if (!friend.friends.includes(currentUser.id)) friend.friends.push(currentUser.id);
    saveData();
    render();
  });
}

function renderChat() {
  const friends = data.users.filter((user) => currentUser.friends.includes(user.id));
  selectedChatUserId = selectedChatUserId || friends[0]?.id || null;
  const selected = data.users.find((user) => user.id === selectedChatUserId);
  const messages = selected ? data.chats.filter((chat) => {
    return (chat.from === currentUser.id && chat.to === selected.id) || (chat.from === selected.id && chat.to === currentUser.id);
  }) : [];

  document.getElementById("view").innerHTML = `
    <section class="card chat-layout">
      <aside class="chat-people">
        <div class="section-title"><h3>Friends</h3></div>
        <div class="list">
          ${friends.map((friend) => `<button class="btn ${selectedChatUserId === friend.id ? "" : "secondary"}" data-chat-user="${friend.id}">${friend.name}</button>`).join("") || `<div class="empty">Add friends first.</div>`}
        </div>
      </aside>
      <div class="chat-room">
        <div class="section-title"><h3>${selected ? selected.name : "No chat selected"}</h3></div>
        <div class="messages">
          ${messages.map((message) => `<div class="bubble ${message.from === currentUser.id ? "mine" : ""}">${message.message}<br><small>${message.createdAt}</small></div>`).join("") || `<div class="empty">No messages yet.</div>`}
        </div>
        ${selected ? `<form class="form two" id="chatForm"><input name="message" placeholder="Type a private message..." required /><button class="btn" type="submit">Send</button></form>` : ""}
      </div>
    </section>
  `;

  document.querySelectorAll("[data-chat-user]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedChatUserId = button.dataset.chatUser;
      render();
    });
  });
  const form = document.getElementById("chatForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = new FormData(event.currentTarget).get("message");
      data.chats.push({ id: uid("c"), from: currentUser.id, to: selectedChatUserId, message, createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      saveData();
      render();
    });
  }
}

function renderGroups() {
  const myGroups = data.groups.filter((group) => group.members.includes(currentUser.id));
  selectedGroupId = selectedGroupId || myGroups[0]?.id || null;
  const selected = data.groups.find((group) => group.id === selectedGroupId && group.members.includes(currentUser.id));

  document.getElementById("view").innerHTML = `
    <div class="grid">
      <section class="card span-4">
        <div class="section-title"><h3>Create group</h3></div>
        <form class="form" id="groupForm">
          <div class="field"><label>Group name</label><input name="name" required /></div>
          <button class="btn" type="submit">Create Group</button>
        </form>
        <div class="section-title" style="margin-top: 18px;"><h3>Your groups</h3></div>
        <div class="list">
          ${myGroups.map((group) => `<button class="btn ${selectedGroupId === group.id ? "" : "secondary"}" data-group="${group.id}">${group.name}</button>`).join("") || `<div class="empty">No groups yet.</div>`}
        </div>
      </section>
      <section class="card span-8">
        ${selected ? groupRoom(selected) : `<div class="empty">Create or select a group.</div>`}
      </section>
    </div>
  `;

  document.getElementById("groupForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get("name");
    const group = { id: uid("g"), name, createdBy: currentUser.id, members: [currentUser.id], messages: [] };
    data.groups.push(group);
    selectedGroupId = group.id;
    saveData();
    render();
  });

  document.querySelectorAll("[data-group]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedGroupId = button.dataset.group;
      render();
    });
  });

  const addForm = document.getElementById("groupAddForm");
  if (addForm) {
    addForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const roll = new FormData(event.currentTarget).get("roll").trim().toUpperCase();
      const user = data.users.find((item) => item.roll.toUpperCase() === roll);
      if (!user) {
        alert("No user found with that roll number.");
        return;
      }
      if (!selected.members.includes(user.id)) selected.members.push(user.id);
      saveData();
      render();
    });
  }

  const messageForm = document.getElementById("groupMessageForm");
  if (messageForm) {
    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = new FormData(event.currentTarget).get("message");
      selected.messages.push({ id: uid("gm"), from: currentUser.id, message, createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      saveData();
      render();
    });
  }
}

function groupRoom(group) {
  return `
    <div class="section-title">
      <div><h3>${group.name}</h3><p class="muted">${group.members.map(userName).join(", ")}</p></div>
    </div>
    <form class="form two" id="groupAddForm">
      <input name="roll" placeholder="Add member by roll number" required />
      <button class="btn secondary" type="submit">Add Member</button>
    </form>
    <div class="messages" style="margin-top: 12px;">
      ${group.messages.map((message) => `<div class="bubble ${message.from === currentUser.id ? "mine" : ""}"><strong>${userName(message.from)}</strong><br>${message.message}<br><small>${message.createdAt}</small></div>`).join("") || `<div class="empty">No group messages yet.</div>`}
    </div>
    <form class="form two" id="groupMessageForm" style="margin-top: 12px;">
      <input name="message" placeholder="Message this group..." required />
      <button class="btn" type="submit">Send</button>
    </form>
  `;
}

render();
