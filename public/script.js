const getInternships = async () => {
  try {
    const response = await fetch("api/internships/");
    if (!response.ok) {
      throw new Error("Failed to fetch internships");
    }
    return await response.json();
  } catch (error) {
    console.log('There was a problem with the fetch operation:', error);
  }
};

const updateInternshipStatus = async (id, completed) => {
  console.log("Updating internship:", id, "with completed status:", completed);
  try {
    let response = await fetch(`/api/internships/${id}/completed`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) {
      console.log("error updating internship status");
      throw new Error("Failed to update internship status");
    }
    await response.json();

    const internships = await getInternships();
    updateProgressBar(internships);
    showInternships();
  } catch (error) {
    console.log('There was a problem with the fetch operation:', error);
  }
};

const updateProgressBar = (internships) => {
  const progressBar = document.getElementById("progress-bar");
  if (!progressBar) {
    console.error("Progress bar element not found");
    return;
  }

  const total = internships.length;
  const completed = internships.filter((internship) => internship.completed).length;
  const percentage = (completed / total) * 100;

  progressBar.style.width = `${percentage}%`;
  progressBar.textContent = `${percentage.toFixed(2)}% Completed`;
}

const showInternships = async () => {
  let internships = await getInternships();
  if (!internships) return;
  console.log(internships);

  let internshipsDiv = document.getElementById("internship-list");
  internshipsDiv.innerHTML = "";
  
  internships.forEach((internship) => {
    const section = document.createElement("section"); 
    section.classList.add("internship");

    const completedCheckbox = document.createElement("input");
    completedCheckbox.type = "checkbox";
    completedCheckbox.checked = internship.completed;
    completedCheckbox.addEventListener("change", async (e) => {
      await updateInternshipStatus(internship._id, e.target.checked);
      updateProgressBar(internships);
    });
    section.append(completedCheckbox);

    const a = document.createElement("a");
    a.href = "#";
    a.addEventListener("click", (e) => { 
      e.preventDefault(); 
      displayDetails(internship); 
    });
    section.append(a);

    const h3 = document.createElement("h3");
    h3.innerHTML = internship.name;
    a.append(h3);

    const img = document.createElement("img");
    img.src = internship.img;
    a.append(img);

    internshipsDiv.append(section);
  });

  updateProgressBar(internships);
};

const displayDetails = (internship) => {
  const internshipDetails = document.getElementById("internship-details");
  internshipDetails.innerHTML = "";

  const placeholderMessage = document.getElementById("placeholder-message");

  if (internship) {
    if (placeholderMessage) {
      placeholderMessage.style.display = "none";
    }

    const div = document.createElement("div");
    internshipDetails.append(div);

    const h3 = document.createElement("h3");
    h3.innerHTML = internship.company;
    div.append(h3);

    const dLink = document.createElement("a");
    dLink.innerHTML = "	&#x2715;";
    internshipDetails.append(dLink);
    dLink.id = "delete-link";

    const eLink = document.createElement("a");
    eLink.innerHTML = "&#9998;";
    internshipDetails.append(eLink);
    eLink.id = "edit-link";

    const ul = document.createElement("ul");
    div.append(ul);

    const applicationLink = document.createElement("a");
    const link = internship.link.startsWith("http://") || internship.link.startsWith("https://")
      ? internship.link
      : `http://${internship.link}`;
    applicationLink.href = link;
    applicationLink.textContent = "Application Link";
    applicationLink.target = "_blank";

    const li = document.createElement("li");
    li.appendChild(applicationLink);

    ul.append(li);
    ul.append(getLi(`Internship Name: ${internship.name}`));
    ul.append(getLi(`Internship Location: ${internship.location}`));
    ul.append(getLi(`Application Deadline: ${internship.deadline}`));

    eLink.onclick = (e) => {
      e.preventDefault();
      const dialog = document.getElementById('edit-internship-container');
      dialog.classList.remove("transparent");

      dialog.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById("edit-title").innerHTML = "Edit Details";
      populateEditForm(internship);
    };

    dLink.onclick = (e) => {
      e.preventDefault();
      deleteInternship(internship);
    };
  } else {
    if (placeholderMessage) {
      placeholderMessage.style.display = "block";
    }
  }
};

const getLi = data => {
  const li = document.createElement("li");
  li.textContent = data;
  return li;
};

const deleteInternship = async (internship) => {
  if (confirm(`Are you sure you want to delete ${internship.name}?`)) {
    try {
      let response = await fetch(`/api/internships/${internship._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });
    
      if (!response.ok) {
        console.log("error deleting internship");
        throw new Error("Error deleting internship");
      }
      
      await response.json();
      showInternships();
      document.getElementById("internship-details").innerHTML = "";
      resetEditForm();
    } catch (error) {
      console.log("Error deleting internship:", error);
    }
  }
};

const populateEditForm = (internship) => {
  const form = document.getElementById("edit-internship-form");
  form._id.value = internship._id;
  form.name.value = internship.name;
  form.company.value = internship.company;
  form.link.value = internship.link;
  form.location.value = internship.location;
  form.deadline.value = internship.deadline;
};

const submitAddForm = async (e) => {
  e.preventDefault();
  const form = document.getElementById("add-internship-form");
  const formData = new FormData(form);
  
  try {
    const response = await fetch("/api/internships/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.log("Error posting data");
      throw new Error("Error posting data");
    }

    const internship = await response.json();

    resetAddForm();
    document.getElementById('add-internship-container').classList.add("transparent");
    showInternships();
  } catch (error) {
    console.log("Error posting data:", error);
  } 
};

const submitEditForm = async (e) => {
  e.preventDefault();
  const form = document.getElementById("edit-internship-form");
  const formData = new FormData(form);
  
  try {
    const response = await fetch(`/api/internships/${form._id.value}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      console.log("Error editing data");
      throw new Error("Error editing data");
    }

    const internship = await response.json();

    resetEditForm();
    document.getElementById('edit-internship-container').classList.add("transparent");
    displayDetails(internship);
    showInternships();
  } catch (error) {
    console.log("Error editing data:", error);
  } 
};

const resetAddForm = () => {
  const form = document.getElementById("add-internship-form");
  form.reset();
  form._id = "-1";
};

const resetEditForm = () => {
  const form = document.getElementById("edit-internship-form");
  form.reset();
  form._id = "-1";
};


window.onload = () => {
  showInternships();

  const addButton = document.getElementById("add-button");
  const closeButtons = document.querySelectorAll(".close");
  const addForm = document.getElementById("add-internship-form");
  const editForm = document.getElementById("edit-internship-form");

  if (addButton) {
    addButton.onclick = (e) => {
      e.preventDefault();
      const dialog = document.getElementById('add-internship-container');
      if (dialog.classList.contains("transparent")) {
        dialog.classList.remove("transparent");

        const form = document.getElementById("add-internship-form");
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          console.error("Error with scroll");
        }
      } else {
        dialog.classList.add("transparent");
      }

      document.getElementById("add-title").innerHTML = "Add Prospect";
      resetAddForm();
    };
  }

  closeButtons.forEach(button => {
    button.onclick = () => {
      const dialogContainer = button.closest('.dialog');
      if (dialogContainer) {
        dialogContainer.classList.add("transparent");
      } else {
        console.error("Error with close button");
      }
    };
  });

  if (addForm) {
    addForm.onsubmit = async (e) => {
      await submitAddForm(e);
      showInternships();
    };
  }

  if (editForm) {
    editForm.onsubmit = async (e) => {
      await submitEditForm(e);
      showInternships();
    };
  }
};
