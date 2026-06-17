const header = document.querySelector("[data-elevate]");
const reveals = document.querySelectorAll(".reveal");
const cursor = document.querySelector(".cursor");
const magnets = document.querySelectorAll(".magnet");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const leadTable = document.querySelector("[data-lead-table]");
const clearLeads = document.querySelector("[data-clear-leads]");
const categoryTabs = document.querySelectorAll("[data-category-tab]");
const categoryPanels = document.querySelectorAll("[data-category-panel]");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminPanels = document.querySelectorAll("[data-admin-panel]");
const workForm = document.querySelector("[data-work-form]");
const workStatus = document.querySelector("[data-work-status]");
const resetWorkFormButton = document.querySelector("[data-reset-work-form]");
const managedWorkTable = document.querySelector("[data-managed-work-table]");
const loginScreen = document.querySelector("[data-login-screen]");
const loginForm = document.querySelector("[data-login-form]");
const loginStatus = document.querySelector("[data-login-status]");
const logoutButton = document.querySelector("[data-logout]");
const categoryForm = document.querySelector("[data-category-form]");
const categoryStatus = document.querySelector("[data-category-status]");
const categoryTable = document.querySelector("[data-category-table]");
const categorySelect = document.querySelector("[data-category-select]");
const summaryGrid = document.querySelector("[data-summary-grid]");
const analyticsSummary = document.querySelector("[data-analytics-summary]");
const activityTable = document.querySelector("[data-activity-table]");
const analyticsActivityTable = document.querySelector(
  "[data-analytics-activity-table]"
);
const popularTable = document.querySelector("[data-popular-table]");
const sourceTable = document.querySelector("[data-source-table]");
const marqueeRows = document.querySelectorAll("[data-marquee-row]");
const specialCards = document.querySelectorAll(".special-card");
const metalCompass = document.querySelector("[data-metal-compass]");
const heroSection = document.querySelector(".hero");

const leadStorageKey = "portfolioLeads";
const workStorageKey = "portfolioWorks";
const categoryStorageKey = "portfolioCategories";
const analyticsStorageKey = "portfolioAnalytics";
const activityStorageKey = "portfolioActivity";
const authStorageKey = "portfolioAdminAuthed";

const defaultCategories = [
  { id: "all", label: "전체 보기", locked: true },
  { id: "detail", label: "상세페이지", locked: true },
  { id: "branding", label: "브랜딩", locked: true },
  { id: "photo", label: "제품촬영", locked: true },
  { id: "video", label: "영상편집", locked: true },
];

const detailSubcategories = [
  { id: "all", label: "all" },
  { id: "living", label: "생활가전/용품" },
  { id: "kitchen", label: "주방가전" },
  { id: "beauty", label: "뷰티/패션" },
  { id: "food", label: "푸드/헬스" },
];

const legacyDetailCategories = ["living", "kitchen", "beauty", "food"];

const defaultWorkItems = [];

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

reveals.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 70, 260)}ms`;
  revealObserver.observe(element);
});

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const readLeads = () => readJson(leadStorageKey, []);
const writeLeads = (leads) => writeJson(leadStorageKey, leads);
const readWorks = () => readJson(workStorageKey, []);
const writeWorks = (works) => writeJson(workStorageKey, works);
const readCategories = () => {
  const stored = readJson(categoryStorageKey, []);
  const custom = stored.filter(
    (category) =>
      !category.locked &&
      !defaultCategories.some((item) => item.id === category.id) &&
      !legacyDetailCategories.includes(category.id)
  );
  return [...defaultCategories, ...custom];
};
const writeCategories = (categories) =>
  writeJson(categoryStorageKey, categories);
const readAnalytics = () =>
  readJson(analyticsStorageKey, {
    visits: [],
    workClicks: {},
    sources: {},
  });
const writeAnalytics = (analytics) => writeJson(analyticsStorageKey, analytics);
const readActivity = () => readJson(activityStorageKey, []);
const writeActivity = (activity) => writeJson(activityStorageKey, activity);

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const categoryLabel = (id) =>
  readCategories().find((category) => category.id === id)?.label || id;

const detailSubcategoryLabel = (id) =>
  detailSubcategories.find((category) => category.id === id)?.label || id;

const normalizeWork = (work) => {
  if (legacyDetailCategories.includes(work.category)) {
    return { ...work, category: "detail", detailCategory: work.category };
  }
  return {
    ...work,
    detailCategory: work.category === "detail" ? work.detailCategory || "all" : "",
  };
};

const readNormalizedWorks = () => readWorks().map(normalizeWork);

const getTrafficSource = () => {
  const params = new URLSearchParams(window.location.search);
  const raw =
    params.get("utm_source") ||
    params.get("source") ||
    document.referrer ||
    "direct";

  const source = String(raw).toLowerCase();
  if (source.includes("instagram")) return "Instagram";
  if (source.includes("naver")) return "Naver";
  if (source.includes("google")) return "Google";
  if (source.includes("ad") || source.includes("campaign")) return "광고 링크";
  if (source === "direct") return "direct";
  return raw;
};

const addActivity = (type, text) => {
  writeActivity([
    {
      id: crypto.randomUUID(),
      type,
      text,
      createdAt: new Date().toISOString(),
    },
    ...readActivity(),
  ].slice(0, 30));
};

const trackVisit = () => {
  if (location.pathname.endsWith("admin.html")) return;

  const analytics = readAnalytics();
  const source = getTrafficSource();
  analytics.visits = [
    ...(analytics.visits || []),
    {
      id: crypto.randomUUID(),
      path: location.pathname || "/",
      source,
      createdAt: new Date().toISOString(),
    },
  ].slice(-500);
  analytics.sources = analytics.sources || {};
  analytics.sources[source] = (analytics.sources[source] || 0) + 1;
  writeAnalytics(analytics);
};

trackVisit();

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const compassMotion = {
  pointerX: 0,
  pointerY: 0,
  scroll: 0,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateCompassMotion = () => {
  if (!metalCompass) return;
  if (heroSection) {
    const rect = heroSection.getBoundingClientRect();
    compassMotion.scroll = clamp(-rect.top / Math.max(rect.height * 0.82, 1), 0, 1);
  }

  const rotateX = 9 - compassMotion.scroll * 18 - compassMotion.pointerY * 5;
  const rotateY = -16 + compassMotion.scroll * 30 + compassMotion.pointerX * 7;
  const rotateZ = -5 + compassMotion.scroll * 88;
  const translateY = -compassMotion.scroll * 34;
  const scale = 1 - compassMotion.scroll * 0.04;

  metalCompass.style.setProperty(
    "--compass-transform",
    `translate3d(0, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`
  );
};

if (metalCompass) {
  updateCompassMotion();
  window.addEventListener("scroll", updateCompassMotion, { passive: true });
  window.addEventListener(
    "pointermove",
    (event) => {
      compassMotion.pointerX = clamp(
        (event.clientX / window.innerWidth - 0.5) * 2,
        -1,
        1
      );
      compassMotion.pointerY = clamp(
        (event.clientY / window.innerHeight - 0.5) * 2,
        -1,
        1
      );
      updateCompassMotion();
    },
    { passive: true }
  );
}

if (cursor) {
  window.addEventListener("pointermove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = "1";
  });
}

magnets.forEach((element) => {
  element.addEventListener("pointerenter", () => {
    cursor?.classList.add("is-active");
  });

  element.addEventListener("pointerleave", () => {
    cursor?.classList.remove("is-active");
    element.style.transform = "";
  });

  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
  });
});

if (loginScreen) {
  const isAuthed = sessionStorage.getItem(authStorageKey) === "true";
  loginScreen.classList.toggle("is-hidden", isAuthed);
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const user = formData.get("user");
    const password = formData.get("password");

    if (user === "admin" && password === "portfolio") {
      sessionStorage.setItem(authStorageKey, "true");
      loginScreen.classList.add("is-hidden");
      addActivity("login", "관리자 로그인");
      renderAdmin();
      return;
    }

    loginStatus.textContent = "아이디 또는 비밀번호를 확인해주세요.";
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem(authStorageKey);
    loginScreen?.classList.remove("is-hidden");
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const lead = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "신규",
      source: getTrafficSource(),
      name: formData.get("name"),
      email: formData.get("email"),
      project: formData.get("project"),
      budget: formData.get("budget"),
      message: formData.get("message"),
    };

    writeLeads([lead, ...readLeads()]);
    addActivity("lead", `${lead.name}님의 문의 접수`);
    contactForm.reset();
    formStatus.textContent =
      "문의가 저장되었습니다. 관리자 페이지에서 확인할 수 있어요.";
  });
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });

const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsText(file);
  });

const fillCategorySelects = () => {
  const options = readCategories()
    .filter((category) => category.id !== "all")
    .map(
      (category) =>
        `<option value="${escapeHtml(category.id)}">${escapeHtml(
          category.label
        )}</option>`
    )
    .join("");

  document.querySelectorAll("[data-category-select]").forEach((select) => {
    const current = select.value;
    select.innerHTML = options;
    if (current) select.value = current;
  });
};

const resetWorkForm = () => {
  if (!workForm) return;
  workForm.reset();
  workForm.elements.id.value = "";
  workForm.elements.isPublished.checked = true;
  workForm.elements.isFeatured.checked = false;
  workForm.elements.sortOrder.value = "0";
  if (workStatus) workStatus.textContent = "";
};

if (workForm) {
  workForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(workForm);
    const id = formData.get("id");
    const imageFile = formData.get("image");
    const detailFile = formData.get("detailFile");
    const existing = readWorks().find((work) => work.id === id);
    let image = existing?.image || "";
    let detailHtml = String(formData.get("detailHtml") || "").trim();

    if (imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > 1.5 * 1024 * 1024) {
        workStatus.textContent =
          "로컬 데모에서는 1.5MB 이하 이미지를 권장합니다.";
        return;
      }
      image = await readFileAsDataUrl(imageFile);
    }

    if (detailFile instanceof File && detailFile.size > 0) {
      if (detailFile.size > 2 * 1024 * 1024) {
        workStatus.textContent = "HTML 파일은 2MB 이하를 권장합니다.";
        return;
      }
      detailHtml = String(await readFileAsText(detailFile)).trim();
    }

    if (!image) {
      workStatus.textContent = "대표 이미지를 선택해주세요.";
      return;
    }

    const work = {
      id: id || crypto.randomUUID(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: formData.get("category"),
      detailCategory:
        formData.get("category") === "detail"
          ? formData.get("detailCategory") || "all"
          : "",
      title: formData.get("title"),
      description: formData.get("description"),
      detailHtml,
      image,
      sortOrder: Number(formData.get("sortOrder") || 0),
      isPublished: formData.get("isPublished") === "on",
      isFeatured: formData.get("isFeatured") === "on",
    };

    const works = readWorks();
    const nextWorks = existing
      ? works.map((item) => (item.id === work.id ? work : item))
      : [work, ...works];

    writeWorks(nextWorks);
    addActivity(
      existing ? "work-update" : "work-create",
      `${work.title} ${existing ? "수정" : "등록"}`
    );
    workStatus.textContent = existing
      ? "작업물이 수정되었습니다."
      : "작업물이 등록되었습니다.";
    resetWorkForm();
    renderAdmin();
    renderUploadedWorks();
    renderHomeWorkSlider();
    renderFeaturedWorks();
  });
}

resetWorkFormButton?.addEventListener("click", resetWorkForm);

const createUploadedWorkCard = (work) => {
  const card = document.createElement("article");
  card.className = "detail-card";
  card.dataset.uploadedWork = work.id;
  card.dataset.workId = work.id;
  card.dataset.workTitle = work.title;
  if (work.category === "detail") {
    card.dataset.detailSubcategory = work.detailCategory || "all";
  }
  if (work.detailHtml) {
    card.dataset.detailUrl = `./detail.html?id=${encodeURIComponent(work.id)}`;
    card.setAttribute("role", "link");
    card.tabIndex = 0;
  }
  card.innerHTML = `
    <div class="detail-thumb has-image">
      <img src="${work.image}" alt="${escapeHtml(work.title)}" />
    </div>
    <strong>${escapeHtml(work.title)}</strong>
    ${work.description ? `<p>${escapeHtml(work.description)}</p>` : ""}
    ${
      work.category === "detail" && work.detailCategory
        ? `<p class="work-meta">${escapeHtml(detailSubcategoryLabel(work.detailCategory))}</p>`
        : ""
    }
  `;
  return card;
};

const filterDetailCards = (subcategory = "all") => {
  document
    .querySelectorAll('[data-category-panel="detail"] [data-detail-subcategory]')
    .forEach((card) => {
      card.hidden = subcategory !== "all" && card.dataset.detailSubcategory !== subcategory;
    });
};

const renderUploadedWorks = () => {
  syncWorkCategories();
  if (document.querySelectorAll("[data-category-panel]").length === 0) return;

  document.querySelectorAll("[data-uploaded-work]").forEach((card) => {
    card.remove();
  });

  const works = readNormalizedWorks()
    .filter((work) => work.isPublished !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  works.forEach((work) => {
    const allGrid = document.querySelector('[data-category-panel="all"] .detail-grid');
    allGrid?.appendChild(createUploadedWorkCard(work));

    const panel = document.querySelector(
      `[data-category-panel="${work.category}"]`
    );
    const grid = panel?.querySelector(".detail-grid");
    if (!grid || work.category === "all") return;
    grid.appendChild(createUploadedWorkCard(work));
  });

  const activeSubcategory =
    document.querySelector("[data-subcategory-tab].is-active")?.dataset
      .subcategoryTab || "all";
  filterDetailCards(activeSubcategory);
};

const getHomeWorkItems = () => [
  ...defaultWorkItems,
  ...readNormalizedWorks()
    .filter((work) => work.isPublished !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
];

const createHomeWorkSlide = (work, index) => {
  const hasImage = Boolean(work.image);
  const thumbClass = hasImage ? "has-image" : work.thumbClass || "thumb-living-1";
  const title = work.title || "포트폴리오 작업물";
  const href = work.detailHtml
    ? `./detail.html?id=${encodeURIComponent(work.id)}`
    : "./work.html";
  const description =
    work.description ||
    `${categoryLabel(work.category)} 카테고리의 상세페이지 작업물입니다.`;

  return `
    <a
      class="work-slide detail-card"
      href="${href}"
      data-slider-work="${escapeHtml(work.id || `default-${index}`)}"
      data-work-id="${escapeHtml(work.id || `default-${index}`)}"
      data-work-title="${escapeHtml(title)}"
    >
      <div class="detail-thumb ${escapeHtml(thumbClass)}">
        ${
          hasImage
            ? `<img src="${work.image}" alt="${escapeHtml(title)}" />`
            : ""
        }
      </div>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(description)}</p>
    </a>
  `;
};

const updateHomeWorkSliderSize = () => {
  const slider = document.querySelector("[data-work-slider]");
  if (!slider) return;

  const gapValue = getComputedStyle(slider)
    .getPropertyValue("--slide-gap")
    .replace("px", "")
    .trim();
  const gap = Number(gapValue) || 18;
  const width = slider.clientWidth;
  const visibleCount = width <= 620 ? 1 : width <= 900 ? 2 : 4;
  const slideWidth = (width - gap * (visibleCount - 1)) / visibleCount;
  slider.style.setProperty("--slide-width", `${Math.max(slideWidth, 0)}px`);
};

const renderHomeWorkSlider = () => {
  const track = document.querySelector("[data-work-slider-track]");
  if (!track) return;

  const works = getHomeWorkItems();
  const loopWorks = [...works, ...works];
  track.innerHTML = loopWorks.map(createHomeWorkSlide).join("");
  track.style.setProperty(
    "--slider-duration",
    `${Math.max(32, works.length * 2.6)}s`
  );
  updateHomeWorkSliderSize();
};

const renderFeaturedWorks = () => {
  const homeGrid = document.querySelector("#works .work-grid");
  if (!homeGrid) return;

  document.querySelectorAll("[data-featured-work]").forEach((card) => {
    card.remove();
  });

  const featured = readNormalizedWorks()
    .filter((work) => work.isPublished !== false && work.isFeatured)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .slice(0, 3);

  featured.reverse().forEach((work) => {
    const card = document.createElement("article");
    card.className = "work-card reveal is-visible";
    card.dataset.featuredWork = work.id;
    card.dataset.workId = work.id;
    card.dataset.workTitle = work.title;
    card.innerHTML = `
      <div class="work-media">
        <img src="${work.image}" alt="${escapeHtml(work.title)}" />
      </div>
      <div class="work-info">
        <span>${escapeHtml(categoryLabel(work.category))}</span>
        <h3>${escapeHtml(work.title)}</h3>
        <p>${escapeHtml(work.description || "대표 노출 작업물입니다.")}</p>
      </div>
    `;
    homeGrid.prepend(card);
  });
};

const renderWorkDetailPage = () => {
  const frame = document.querySelector("[data-detail-frame]");
  if (!frame) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const work = readWorks().find((item) => item.id === id);
  const title = document.querySelector("[data-detail-title]");
  const description = document.querySelector("[data-detail-description]");
  const empty = document.querySelector("[data-detail-empty]");

  if (title) title.textContent = work?.title || "작업물 상세페이지";
  if (description) {
    description.textContent =
      work?.description ||
      "관리자 페이지에서 등록한 HTML 상세페이지를 확인할 수 있습니다.";
  }

  if (!work?.detailHtml) {
    frame.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }

  frame.hidden = false;
  if (empty) empty.hidden = true;
  frame.srcdoc = work.detailHtml;
};

const trackWorkClick = (card) => {
  const title =
    card.dataset.workTitle ||
    card.querySelector("strong, h3")?.textContent?.trim() ||
    "작업물";
  const id = card.dataset.workId || title;
  const analytics = readAnalytics();
  analytics.workClicks = analytics.workClicks || {};
  analytics.workClicks[id] = {
    title,
    count: (analytics.workClicks[id]?.count || 0) + 1,
  };
  writeAnalytics(analytics);
};

document.addEventListener("click", (event) => {
  const card = event.target.closest(".detail-card, .work-card");
  if (!card) return;
  trackWorkClick(card);
  if (
    card.dataset.detailUrl &&
    !event.target.closest("a, button, input, textarea, select")
  ) {
    window.location.href = card.dataset.detailUrl;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest?.("[data-detail-url]");
  if (!card) return;
  event.preventDefault();
  trackWorkClick(card);
  window.location.href = card.dataset.detailUrl;
});

specialCards.forEach((card) => {
  card.addEventListener("click", () => {
    specialCards.forEach((item) => {
      item.classList.toggle("is-open", item === card && !item.classList.contains("is-open"));
    });
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    card.click();
  });
});

const serviceMarqueeState = [...marqueeRows].map((row, index) => ({
  row,
  x: 0,
  speed: 0.42 + index * 0.08,
  direction: Number(row.dataset.direction || 1),
  ready: false,
}));

let lastScrollY = window.scrollY;
let scrollBoost = 0;

window.addEventListener(
  "scroll",
  () => {
    scrollBoost = (window.scrollY - lastScrollY) * 0.04;
    lastScrollY = window.scrollY;
  },
  { passive: true }
);

const animateServiceMarquee = () => {
  serviceMarqueeState.forEach((item) => {
    const track = item.row.querySelector(".service-track");
    const width = track?.offsetWidth || 1;

    if (!item.ready) {
      item.x = item.direction > 0 ? -width : 0;
      item.ready = true;
    }

    item.x += (item.speed + scrollBoost) * item.direction;

    if (item.direction > 0 && item.x >= 0) item.x = -width;
    if (item.x < -width) item.x = 0;

    item.row.style.transform = `translate3d(${item.x}px, 0, 0)`;
  });

  scrollBoost *= 0.9;

  if (serviceMarqueeState.length > 0) {
    requestAnimationFrame(animateServiceMarquee);
  }
};

animateServiceMarquee();

const syncWorkCategories = () => {
  const tabContainer = document.querySelector(".category-tabs");
  const workSection = document.querySelector("[data-work-page]");
  if (!tabContainer || !workSection) return;

  const categories = readCategories();
  const categoryIds = categories.map((category) => category.id);

  tabContainer.querySelectorAll("[data-category-tab]").forEach((button) => {
    if (!categoryIds.includes(button.dataset.categoryTab)) button.remove();
  });
  workSection.querySelectorAll("[data-category-panel]").forEach((panel) => {
    if (!categoryIds.includes(panel.dataset.categoryPanel)) panel.remove();
  });

  categories.forEach((category, index) => {
    let tab = tabContainer.querySelector(
      `[data-category-tab="${category.id}"]`
    );
    if (!tab) {
      tab = document.createElement("button");
      tab.type = "button";
      tab.dataset.categoryTab = category.id;
      tabContainer.appendChild(tab);
    }
    tab.textContent = category.label;

    let panel = workSection.querySelector(
      `[data-category-panel="${category.id}"]`
    );
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "category-panel";
      panel.dataset.categoryPanel = category.id;
      panel.innerHTML = `
        <div class="category-heading">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h2>${escapeHtml(category.label)}</h2>
        </div>
        <div class="detail-grid"></div>
      `;
      workSection.appendChild(panel);
    }

    panel.querySelector(".category-heading span").textContent = String(index + 1)
      .padStart(2, "0");
    panel.querySelector(".category-heading h2").textContent = category.label;
  });

  if (!tabContainer.querySelector("[data-category-tab].is-active")) {
    tabContainer.querySelector("[data-category-tab]")?.classList.add("is-active");
    workSection.querySelector("[data-category-panel]")?.classList.add("is-active");
  }
};

document.querySelector(".category-tabs")?.addEventListener("click", (event) => {
  const tabButton = event.target.closest("[data-category-tab]");
  if (!tabButton) return;
  const category = tabButton.dataset.categoryTab;

  document.querySelectorAll("[data-category-tab]").forEach((button) => {
    button.classList.toggle("is-active", button === tabButton);
  });

  document.querySelectorAll("[data-category-panel]").forEach((panel) => {
    panel.classList.toggle(
      "is-active",
      panel.dataset.categoryPanel === category
    );
  });
});

document.querySelector(".subcategory-tabs")?.addEventListener("click", (event) => {
  const tabButton = event.target.closest("[data-subcategory-tab]");
  if (!tabButton) return;
  const subcategory = tabButton.dataset.subcategoryTab;

  document.querySelectorAll("[data-subcategory-tab]").forEach((button) => {
    button.classList.toggle("is-active", button === tabButton);
  });
  filterDetailCards(subcategory);
});

adminTabs.forEach((tabButton) => {
  tabButton.addEventListener("click", () => {
    const panelId = tabButton.dataset.adminTab;

    adminTabs.forEach((button) => {
      button.classList.toggle("is-active", button === tabButton);
    });

    adminPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.adminPanel === panelId);
    });
  });
});

const renderLeads = () => {
  if (!leadTable) return;

  const leads = readLeads();
  if (leads.length === 0) {
    leadTable.innerHTML = '<div class="empty">아직 접수된 문의가 없습니다.</div>';
    return;
  }

  leadTable.innerHTML = leads
    .map((lead) => {
      const date = new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(lead.createdAt));

      return `
        <article class="table-row lead-row">
          <div>
            <strong>${escapeHtml(lead.name)}</strong>
            <span>${escapeHtml(lead.email)}</span>
          </div>
          <div>
            <strong>${escapeHtml(lead.project)}</strong>
            <p>${escapeHtml(lead.message)}</p>
          </div>
          <div>
            <span class="status-pill">${escapeHtml(lead.status || "신규")}</span>
            <p>${escapeHtml(lead.source)}</p>
          </div>
          <div>
            <span>${date}</span>
            <select data-lead-status="${lead.id}">
              ${["신규", "확인중", "답변완료", "보류"]
                .map(
                  (status) =>
                    `<option ${
                      (lead.status || "신규") === status ? "selected" : ""
                    }>${status}</option>`
                )
                .join("")}
            </select>
          </div>
        </article>
      `;
    })
    .join("");
};

leadTable?.addEventListener("change", (event) => {
  const select = event.target.closest("[data-lead-status]");
  if (!select) return;
  const id = select.dataset.leadStatus;
  writeLeads(
    readLeads().map((lead) =>
      lead.id === id ? { ...lead, status: select.value } : lead
    )
  );
  addActivity("lead-status", `문의 상태를 ${select.value}(으)로 변경`);
  renderAdmin();
});

clearLeads?.addEventListener("click", () => {
  writeLeads([]);
  addActivity("lead-clear", "문의 내역 전체 삭제");
  renderAdmin();
});

const renderManagedWorks = () => {
  if (!managedWorkTable) return;

  const works = readNormalizedWorks();
  if (works.length === 0) {
    managedWorkTable.innerHTML =
      '<div class="empty">아직 등록된 작업물이 없습니다.</div>';
    return;
  }

  managedWorkTable.innerHTML = works
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map(
      (work) => `
        <article class="table-row work-row">
          <img src="${work.image}" alt="${escapeHtml(work.title)}" />
          <div>
            <strong>${escapeHtml(work.title)}</strong>
            <span>${escapeHtml(categoryLabel(work.category))}</span>
            <p>${escapeHtml(work.description)}</p>
            <p>
              ${work.isPublished === false ? "비공개" : "공개"} ·
              ${work.isFeatured ? "메인 노출" : "일반"} ·
              정렬 ${Number(work.sortOrder || 0)} ·
              ${work.detailHtml ? "HTML 상세 있음" : "HTML 상세 없음"}
            </p>
          </div>
          <div class="row-actions">
            <button class="mini-button" type="button" data-edit-work="${
              work.id
            }">수정</button>
            <button class="mini-button" type="button" data-toggle-publish="${
              work.id
            }">${work.isPublished === false ? "공개" : "비공개"}</button>
            <button class="mini-button" type="button" data-toggle-feature="${
              work.id
            }">${work.isFeatured ? "메인 해제" : "메인 노출"}</button>
            <button class="mini-button" type="button" data-delete-work="${
              work.id
            }">삭제</button>
          </div>
        </article>
      `
    )
    .join("");
};

managedWorkTable?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-work]");
  const publishButton = event.target.closest("[data-toggle-publish]");
  const featureButton = event.target.closest("[data-toggle-feature]");
  const deleteButton = event.target.closest("[data-delete-work]");

  if (editButton) {
    const work = readNormalizedWorks().find(
      (item) => item.id === editButton.dataset.editWork
    );
    if (!work || !workForm) return;
    fillCategorySelects();
    workForm.elements.id.value = work.id;
    workForm.elements.category.value = work.category;
    if (workForm.elements.detailCategory) {
      workForm.elements.detailCategory.value = work.detailCategory || "all";
    }
    workForm.elements.title.value = work.title;
    workForm.elements.description.value = work.description || "";
    if (workForm.elements.detailHtml) {
      workForm.elements.detailHtml.value = work.detailHtml || "";
    }
    workForm.elements.sortOrder.value = work.sortOrder || 0;
    workForm.elements.isPublished.checked = work.isPublished !== false;
    workForm.elements.isFeatured.checked = Boolean(work.isFeatured);
    workStatus.textContent = "수정할 내용을 변경한 뒤 저장해주세요.";
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const updateWork = (id, updater, activityText) => {
    writeWorks(
      readWorks().map((work) => (work.id === id ? updater(work) : work))
    );
    addActivity("work-update", activityText);
    renderAdmin();
    renderUploadedWorks();
    renderHomeWorkSlider();
    renderFeaturedWorks();
  };

  if (publishButton) {
    updateWork(
      publishButton.dataset.togglePublish,
      (work) => ({ ...work, isPublished: work.isPublished === false }),
      "작업물 공개 상태 변경"
    );
  }

  if (featureButton) {
    updateWork(
      featureButton.dataset.toggleFeature,
      (work) => ({ ...work, isFeatured: !work.isFeatured }),
      "작업물 메인 노출 상태 변경"
    );
  }

  if (deleteButton) {
    const id = deleteButton.dataset.deleteWork;
    const work = readWorks().find((item) => item.id === id);
    writeWorks(readWorks().filter((item) => item.id !== id));
    addActivity("work-delete", `${work?.title || "작업물"} 삭제`);
    renderAdmin();
    renderUploadedWorks();
    renderFeaturedWorks();
  }
});

if (categoryForm) {
  categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(categoryForm);
    const label = String(formData.get("label") || "").trim();
    if (!label) return;
    const id = `cat-${Date.now()}`;
    writeCategories([...readCategories(), { id, label, locked: false }]);
    addActivity("category-create", `${label} 카테고리 추가`);
    categoryForm.reset();
    categoryStatus.textContent = "카테고리가 추가되었습니다.";
    renderAdmin();
  });
}

const renderCategories = () => {
  fillCategorySelects();
  if (!categoryTable) return;

  categoryTable.innerHTML = readCategories()
    .map(
      (category) => `
        <article class="table-row category-row">
          <div>
            <strong>${escapeHtml(category.label)}</strong>
            <span>${escapeHtml(category.id)}</span>
          </div>
          <div class="row-actions">
            ${
              category.locked
                ? '<span class="status-pill">기본</span>'
                : `<button class="mini-button" type="button" data-delete-category="${category.id}">삭제</button>`
            }
          </div>
        </article>
      `
    )
    .join("");
};

categoryTable?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-category]");
  if (!deleteButton) return;

  const id = deleteButton.dataset.deleteCategory;
  writeCategories(readCategories().filter((category) => category.id !== id));
  writeWorks(readWorks().filter((work) => work.category !== id));
  addActivity("category-delete", "카테고리 삭제");
  renderAdmin();
  renderUploadedWorks();
  renderHomeWorkSlider();
});

const getTodayVisits = () => {
  const today = new Date().toDateString();
  return readAnalytics().visits.filter(
    (visit) => new Date(visit.createdAt).toDateString() === today
  ).length;
};

const getConversionRate = () => {
  const totalVisits = readAnalytics().visits.length;
  if (totalVisits === 0) return "0%";
  return `${Math.round((readLeads().length / totalVisits) * 100)}%`;
};

const renderSummary = () => {
  const analytics = readAnalytics();
  const cards = [
    ["총 작업물", readWorks().length],
    ["총 문의", readLeads().length],
    ["오늘 방문자", getTodayVisits()],
    ["문의 전환율", getConversionRate()],
  ];
  const html = cards
    .map(
      ([label, value]) => `
        <div class="summary-card">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `
    )
    .join("");

  if (summaryGrid) summaryGrid.innerHTML = html;
  if (analyticsSummary) {
    analyticsSummary.innerHTML = [
      ["오늘 방문자", getTodayVisits()],
      ["총 방문자", analytics.visits.length],
      ["총 문의", readLeads().length],
      ["문의 전환율", getConversionRate()],
    ]
      .map(
        ([label, value]) => `
          <div class="summary-card">
            <span>${label}</span>
            <strong>${value}</strong>
          </div>
        `
      )
      .join("");
  }
};

const renderActivities = () => {
  const rows = readActivity()
    .slice(0, 8)
    .map((activity) => {
      const date = new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(activity.createdAt));
      return `
        <article class="table-row activity-row">
          <div>
            <strong>${escapeHtml(activity.text)}</strong>
            <span>${escapeHtml(activity.type)}</span>
          </div>
          <span>${date}</span>
        </article>
      `;
    })
    .join("");

  const html = rows || '<div class="empty">최근 활동이 없습니다.</div>';
  if (activityTable) activityTable.innerHTML = html;
  if (analyticsActivityTable) analyticsActivityTable.innerHTML = html;
};

const renderPopularWorks = () => {
  if (!popularTable) return;

  const rows = Object.values(readAnalytics().workClicks || {})
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(
      (work) => `
        <article class="table-row popular-row">
          <strong>${escapeHtml(work.title)}</strong>
          <span>${work.count} clicks</span>
        </article>
      `
    )
    .join("");
  popularTable.innerHTML = rows || '<div class="empty">아직 클릭 기록이 없습니다.</div>';
};

const renderSources = () => {
  if (!sourceTable) return;

  const rows = Object.entries(readAnalytics().sources || {})
    .sort((a, b) => b[1] - a[1])
    .map(
      ([source, count]) => `
        <article class="table-row source-row">
          <strong>${escapeHtml(source)}</strong>
          <span>${count} visits</span>
        </article>
      `
    )
    .join("");
  sourceTable.innerHTML = rows || '<div class="empty">아직 유입 기록이 없습니다.</div>';
};

const renderAdmin = () => {
  fillCategorySelects();
  renderSummary();
  renderManagedWorks();
  renderLeads();
  renderCategories();
  renderActivities();
  renderPopularWorks();
  renderSources();
};

renderAdmin();
renderUploadedWorks();
renderHomeWorkSlider();
renderFeaturedWorks();
renderWorkDetailPage();

window.addEventListener("resize", updateHomeWorkSliderSize);
