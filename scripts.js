if (window.location.pathname === "/news") {
  news();
}

async function news() {
  clickEvents();
  let pageNumber = 1;
  let searchValue = "";
  let itemTemplate = document
    .querySelector("[wized=news-post_list-item]")
    .cloneNode(true);
  console.log(itemTemplate);
  let itemGrid = document.querySelector("[wized=news-post_list-wrapper]");
  itemGrid.innerHTML = "";
  showUtilityPopup();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  itemGrid.innerHTML = "";
  initSearch();
  initTags();
  fetchData(pageNumber, searchValue);

  async function fetchData(pageNumber, searchValue) {
    try {
      let url;
      url = `https://api.porsche.nu/api:1fKd013z/posts_paginated?page=${pageNumber}&search=${searchValue}`;
      const response = await fetch(url);
      const data = await response.json();
      let result = data.items;
      if (result.length === 0) {
        showEmptyState();
      }
      if (result.length < 12) {
        document.querySelector(
          "[wized=posts-news-show_more-button]"
        ).style.display = "none";
      } else {
        document.querySelector(
          "[wized=posts-news-show_more-button]"
        ).style.display = "flex";
      }
      createItem(result, itemTemplate);
      return data.items;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function createItem(data, node) {
    console.log(data);
    let itemCount = 0;

    data.forEach((item) => {
      itemCount++;
      const Node = node.cloneNode(true);
      setTitle(Node, item);
      setDescription(Node, item);
      setLink(Node, item);
      setImage(Node, item);
      setTag(Node, item);
      setDate(Node, item);

      itemGrid.appendChild(Node);
      console.log(itemCount);
    });

    function setTitle(node, item) {
      node.querySelector("[wized=news-post_list-title]").textContent =
        item.title;
    }

    function setDescription(node, item) {
      node.querySelector("[wized=news-post_list-summary]").textContent =
        item.summary;
    }

    function setImage(node, item) {
      if (item.cover_image != null) {
        node.querySelector("[wized=news-post_list-image]").src =
          item.cover_image.url;
      } else {
        console.log("no image");
      }
    }

    function setLink(node, item) {
      let origin = window.location.origin;
      let pathname = window.location.pathname;
      node.href = origin + pathname + "/post?post_id=" + item.id;
    }

    function setTag(node, item) {
      node.querySelector("[wized=news-post_list-tag_text]").textContent =
        item.tags[0][0].title;
    }

    function setDate(node, item) {
      node.querySelector("[wized=news-post_list-date_published]").textContent =
        item.date_published;
    }
  }

  function clickEvents() {
    document.addEventListener("click", (e) => {
      const target = e.target;

      if (targetElement(target, "[wized=posts-news-show_more-button]")) {
        loadMore();
        console.log("load more clicked");
      }
      if (targetElement(target, "[wized=news-post_list-tag]")) {
        console.log("tag clicked");
        let element = target.closest("[wized=news-post_list-tag]");
        let row = element.closest(".filter_buttons-wrapper");
        let allTags = row.querySelectorAll("[wized=news-post_list-tag]");
        allTags.forEach((tag) => {
          tag.classList.remove("is-primary");
          tag.classList.add("is-surface");
        });
        element.classList.add("is-primary");
        if (element.querySelector(".button-text").textContent === "Alla") {
          searchValue = "";
        } else {
          searchValue = element.querySelector(".button-text").textContent;
        }
        itemGrid.innerHTML = "";
        pageNumber = 1;
        fetchData(pageNumber, searchValue);
      }
    });

    function targetElement(target, atribute) {
      return target.matches(atribute) || target.closest(atribute);
    }
  }

  function loadMore() {
    pageNumber++;
    fetchData(pageNumber, searchValue);
  }

  function initSearch() {
    let searchInput = document.querySelector("#name-2");
    let debounceTimer;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        if (e.target.value.length > 1) {
          itemGrid.innerHTML = "";
          searchValue = e.target.value;
          pageNumber = 1;
          fetchData(pageNumber, searchValue);
        } else if (e.target.value.length === 0) {
          itemGrid.innerHTML = "";
          searchValue = "";
          pageNumber = 1;
          fetchData(pageNumber, searchValue);
        }
      }, 1000);
    });

    const form = document.querySelector("#email-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("form submit stopped");
      });
    }
  }

  function initTags() {
    let tagComponent = document.querySelector(".filter_filter-buttons-layout");
    let tags = tagComponent.querySelectorAll(".button");
    tags.forEach((tag) => {
      tag.setAttribute("wized", "news-post_list-tag");
    });
  }

  function showUtilityPopup() {
    const popup = document.createElement("div");
    popup.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 9999;
    `;

    let count = 0;
    const duration = 2000; // 2 seconds
    const interval = 20; // Update every 20ms for smooth animation
    const steps = duration / interval;
    const increment = 100 / steps;

    const counter = setInterval(() => {
      count = Math.min(Math.round(count + increment), 100);
      popup.textContent = `Fetching News - Developer Delay Active (${count}%)`;
      popup.style.opacity = 100;
      popup.style.transition = "opacity 1s";

      if (count >= 100) {
        clearInterval(counter);
      }
    }, interval);

    document.body.appendChild(popup);

    setTimeout(() => {
      clearInterval(counter);
      popup.style.opacity = "0";
    }, 2200);
    setTimeout(() => {
      popup.remove();
    }, 3200);
  }

  function showEmptyState() {
    const emptyStateDiv = document.createElement("div");
    emptyStateDiv.style.cssText = `
      width: 100%;
      padding: 40px;
      text-align: center;
      color: #666;
      font-size: 16px;
    `;
    emptyStateDiv.textContent = "No items found...";
    itemGrid.appendChild(emptyStateDiv);
  }
}
