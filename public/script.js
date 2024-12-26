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
    internshipsDiv.append(section);

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
    section.append(a);

    const h3 = document.createElement("h3");
    h3.innerHTML = internship.name;
    a.append(h3);

    const img = document.createElement("img");
    img.src = internship.img;
    section.append(img);

    a.onclick = (e) => {
      e.preventDefault();
      displayDetails(internship);
    };
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
    h3.innerHTML = internship.name;
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
      const dialog = document.querySelector(".dialog");
      dialog.classList.remove("transparent");

      document.getElementById("add-edit-title").innerHTML = "Edit Internship";
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
      resetForm();
    } catch (error) {
      console.log("Error deleting internship:", error);
    }
  }
};

const populateEditForm = (internship) => {
  const form = document.getElementById("add-edit-internship-form");
  form._id.value = internship._id;
  form.name.value = internship.name;
  form.link.value = internship.link;
  form.location.value = internship.location;
  form.deadline.value = internship.deadline;
};

const addEditInternship = async (e) => {
  e.preventDefault();
  const form = document.getElementById("add-edit-internship-form");
  const formData = new FormData(form);
  let response;

  for (let [key, value] of formData.entries()) { 
    console.log(key, value); 
  }

  try {
    if (form._id.value == -1) {
      formData.delete("_id");

      response = await fetch("/api/internships", {
        method: "POST",
        body: formData,
      });
    } else {
      console.log(...formData)

      response = await fetch(`/api/internships/${form._id.value}`, { 
        method: "PUT", 
        body: formData, 
      });
    }

    if (!response.ok) {
      console.log("Error posting data");
      throw new Error("Error posting data");
    }

    const internship = await response.json();

    if (form._id.value != -1) { 
      displayDetails(internship); 
    }

    resetForm();
    document.querySelector(".dialog").classList.add("transparent");
    showInternships();
  } catch (error) {
    console.log("Error posting data:", error);
  } 
};

const resetForm = () => {
  const form = document.getElementById("add-edit-internship-form");
  form.reset();
  form._id = "-1";
};


window.onload = () => {
  showInternships();
  const addButton = document.getElementById("add-button");
  const addEditForm = document.getElementById("add-edit-internship-form");
  const closeButton = document.querySelector(".close");

  if (addButton) {
    addButton.onclick =(e) => {
      e.preventDefault();
      const dialog = document.querySelector(".dialog");
      if(dialog.classList.contains("transparent")) {
        dialog.classList.remove("transparent");
        
        const form = document.getElementById("add-edit-internship-form");
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          console.error("Element with id 'add-edit-title' not found");
        }
      } else {
        dialog.classList.add("transparent");
      }

      document.getElementById("add-edit-title").innerHTML = "Add Internship";
      resetForm();
    }
  }

  if (addEditForm) {
    addEditForm.onsubmit = async (e) => {
      await addEditInternship(e);
      showInternships();
    }
  }

  if (closeButton) {
    closeButton.onclick = () => {
      document.querySelector(".dialog").classList.add("transparent");
    };
  }
};