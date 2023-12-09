const toggleNav = () => {
  document.getElementById("nav-items").classList.toggle("hide-small");
};

const getInternships = async () => {
  try {
    return (await fetch("api/internships/")).json();
  } catch (error) {
    console.log(error);
  }
};

const showInternships = async () => {
  let internships = await getInternships();
  let internshipsDiv = document.getElementById("internship-list");
  internshipsDiv.innerHTML = "";
  internships.forEach((internship) => {
    const section = document.createElement("section");
    section.classList.add("internship");
    internshipsDiv.append(section);

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
};

const displayDetails = (internship) => {
  const internshipDetails = document.getElementById("internship-details");
  internshipDetails.innerHTML = "";

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
  applicationLink.href = internship.link;
  applicationLink.textContent = "Application Link";
  applicationLink.target = "_blank";

  ul.append(applicationLink);
  ul.append(getLi(`Company Name: ${internship.name}`));
  ul.append(getLi(`Internship Location: ${internship.location}`));
  ul.append(getLi(`Application Deadline: ${internship.deadline}`));

  eLink.onclick = (e) => {
    e.preventDefault();
    document.querySelector(".dialog").classList.remove("transparent");
    document.getElementById("add-edit-title").innerHTML = "Edit Internship";
  };

  dLink.onclick = (e) => {
    e.preventDefault();
    deleteInternship(internship);
  };

  populateEditForm(internship);
};

const getLi = data => {
  const li = document.createElement("li");
  li.textContent = data;

  return li;
};

const deleteInternship = async (internship) => {
  let response = await fetch(`/api/internships/${internship._id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  if (response.status != 200) {
    console.log("error deleting");
    return;
  }

  let result = await response.json();
  showInternships();
  document.getElementById("internship-details").innerHTML = "";
  resetForm();
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

  if (form._id.value == -1) {
    formData.delete("_id");

    response = await fetch("/api/internships", {
      method: "POST",
      body: formData,
    });
  }

  else {
    console.log(...formData);

    response = await fetch(`/api/internships/${form._id.value}`, {
      method: "PUT",
      body: formData,
    });
  }

  if (response.status != 200) {
    console.log("Error posting data");
  }

  internship = await response.json();

  if (form._id.value != -1) {
    displayDetails(internship);
  }

  resetForm();
  document.querySelector(".dialog").classList.add("transparent");
  showInternships();
};

const resetForm = () => {
  const form = document.getElementById("add-edit-internship-form");
  form.reset();
  form._id = "-1";
};

const showHideAdd = (e) => {
  e.preventDefault();
  document.querySelector(".dialog").classList.remove("transparent");
  document.getElementById("add-edit-title").innerHTML = "Add Internship";
  resetForm();
};


window.onload = () => {
  showInternships();
  document.getElementById("hamburger").onclick = toggleNav;
  document.getElementById("add-edit-internship-form").onsubmit = addEditInternship;
  document.getElementById("add-link").onclick = showHideAdd;

  document.querySelector(".close").onclick = () => {
    document.querySelector(".dialog").classList.add("transparent");
  };

};