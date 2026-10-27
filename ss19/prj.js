const products = [
  {
    id: 1,
    name: "Tai nghe Bluetooth TWS",
    price: 320000,
    image:
      "https://picsum.photos/seed/mp19-tws/1200/800",
    description: "Chống ồn nhẹ, pin 20h, kết nối ổn định.",
  },
  {
    id: 2,
    name: "Bàn phím cơ 87 phím",
    price: 790000,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=60",
    description: "Switch blue, led trắng, gõ sướng tay.",
  },
  {
    id: 3,
    name: "Chuột không dây công thái học",
    price: 450000,
    image:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=60",
    description: "Thiết kế ergonomic, sạc USB-C.",
  },
  {
    id: 4,
    name: "USB 64GB",
    price: 120000,
    image:
      "https://picsum.photos/seed/mp19-usb/1200/800",
    description: "Nhỏ gọn, tốc độ đọc/ghi ổn định.",
  },
  {
    id: 5,
    name: "Đế tản nhiệt laptop",
    price: 210000,
    image:
      "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=1200&q=60",
    description: "2 quạt gió, đỡ mỏi cổ tay.",
  },
  {
    id: 6,
    name: "Cáp sạc Type-C 1m",
    price: 80000,
    image:
      "https://picsum.photos/seed/mp19-cable/1200/800",
    description: "Bọc dù, hỗ trợ sạc nhanh.",
  },
];

/**
 * cart: { [productId]: { productId:number, quantity:number } }
 * - chỉ lưu productId + quantity, product lấy từ products[]
 */
/** @type {Record<string, {productId:number, quantity:number}>} */
let cart = {};

const STORAGE_KEY = "mp19_cart_v1";


const productsGridEl = document.getElementById("products-grid");
const productsEmptyEl = document.getElementById("products-empty");
const productCountBadgeEl = document.getElementById("product-count-badge");

const cartTbodyEl = document.getElementById("cart-tbody");
const cartEmptyEl = document.getElementById("cart-empty");

const cartLinesBadgeEl = document.getElementById("cart-lines-badge");
const cartQtyBadgeEl = document.getElementById("cart-qty-badge");

const statLinesEl = document.getElementById("stat-lines");
const statQtyEl = document.getElementById("stat-qty");
const statTotalEl = document.getElementById("stat-total");

const clearCartBtn = document.getElementById("clear-cart-btn");


function formatVND(amount) {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("vi-VN").format(safe) + " VNĐ";
}

function findProductById(id) {
  return products.find((p) => p.id === id) || null;
}

function getCartItems() {
  return Object.values(cart);
}

function calcStats() {
  const items = getCartItems();
  const lines = items.length;
  const qty = items.reduce((sum, it) => sum + it.quantity, 0);
  const total = items.reduce((sum, it) => {
    const p = findProductById(it.productId);
    return sum + (p ? p.price * it.quantity : 0);
  }, 0);
  return { lines, qty, total };
}


function renderProducts() {
  productCountBadgeEl.textContent = `${products.length} sản phẩm`;

  if (!products.length) {
    productsEmptyEl.classList.remove("hidden");
    productsGridEl.innerHTML = "";
    return;
  }

  productsEmptyEl.classList.add("hidden");

  productsGridEl.innerHTML = products
    .map((p) => {
      const fallbackImg = `https://picsum.photos/seed/mp19-fallback-${p.id}/1200/800`;
      const imgHtml = p.image
        ? `<img src="${escapeHtmlAttr(p.image)}" data-fallback-src="${escapeHtmlAttr(
            fallbackImg
          )}" alt="${escapeHtmlAttr(p.name)}" loading="lazy" />`
        : `<div class="img-placeholder">No image</div>`;

      const desc = p.description ? `<p class="card-desc">${escapeHtml(p.description)}</p>` : "";

      return `
        <article class="card" data-product-id="${p.id}">
          <div class="card-img">${imgHtml}</div>
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(p.name)}</h3>
            ${desc}
            <div class="card-footer">
              <div class="price">${formatVND(p.price)}</div>
              <button class="btn btn-primary" data-action="add-to-cart" data-product-id="${p.id}">
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  attachProductImageFallbacks();
}

function attachProductImageFallbacks() {
  const imgs = productsGridEl.querySelectorAll("img[data-fallback-src]");
  imgs.forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        const fallback = img.getAttribute("data-fallback-src");
        if (!fallback) return;
        // tránh loop nếu fallback cũng lỗi
        if (img.dataset.fallbackApplied === "1") {
          img.replaceWith(document.createElement("div"));
          return;
        }
        img.dataset.fallbackApplied = "1";
        img.src = fallback;
      },
      { once: false }
    );
  });
}

function renderCart() {
  const items = getCartItems();

  // empty state
  if (!items.length) {
    cartEmptyEl.classList.remove("hidden");
  } else {
    cartEmptyEl.classList.add("hidden");
  }

  // rows
  cartTbodyEl.innerHTML = items
    .map((it) => {
      const p = findProductById(it.productId);
      if (!p) return "";
      const lineTotal = p.price * it.quantity;

      return `
        <tr data-product-id="${p.id}">
          <td>${escapeHtml(p.name)}</td>
          <td class="right">${formatVND(p.price)}</td>
          <td class="center">
            <div class="qty-controls">
              <button class="btn btn-icon btn-ghost" data-action="dec" data-product-id="${p.id}" aria-label="Giảm">-</button>
              <span class="qty">${it.quantity}</span>
              <button class="btn btn-icon btn-ghost" data-action="inc" data-product-id="${p.id}" aria-label="Tăng">+</button>
            </div>
          </td>
          <td class="right">${formatVND(lineTotal)}</td>
          <td class="center">
            <button class="btn btn-ghost" data-action="remove" data-product-id="${p.id}">
              Xóa
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  renderStats();
}

function renderStats() {
  const { lines, qty, total } = calcStats();
  cartLinesBadgeEl.textContent = `${lines} dòng`;
  cartQtyBadgeEl.textContent = `${qty} món`;
  statLinesEl.textContent = String(lines);
  statQtyEl.textContent = String(qty);
  statTotalEl.textContent = formatVND(total);
}


function addToCart(productId) {
  const p = findProductById(productId);
  if (!p) return;

  const key = String(productId);
  if (!cart[key]) {
    cart[key] = { productId, quantity: 1 };
  } else {
    cart[key].quantity += 1;
  }
  saveCart();
  renderCart();
}

function incQty(productId) {
  const key = String(productId);
  if (!cart[key]) return;
  cart[key].quantity += 1;
  saveCart();
  renderCart();
}

function decQty(productId) {
  const key = String(productId);
  if (!cart[key]) return;

  const next = cart[key].quantity - 1;
  if (next < 0) {
    alert("Số lượng không được âm.");
    return;
  }

  if (next === 0) {
    // khuyến nghị: giảm về 0 thì tự xóa
    delete cart[key];
  } else {
    cart[key].quantity = next;
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  const p = findProductById(productId);
  const name = p ? p.name : "sản phẩm này";
  const ok = confirm(`Bạn có chắc muốn xóa \"${name}\" khỏi giỏ hàng không?`);
  if (!ok) return;

  delete cart[String(productId)];
  saveCart();
  renderCart();
}

function clearCart() {
  const ok = confirm(
    "CẢNH BÁO: Bạn sắp xóa TOÀN BỘ giỏ hàng. Thao tác này không thể hoàn tác.\n\nBạn chắc chắn chứ?"
  );
  if (!ok) return;

  cart = {};
  saveCart();
  renderCart();
}


function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    // Không chặn app chạy nếu storage lỗi
    console.warn("Không thể lưu localStorage:", e);
  }
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;

    // sanitize: chỉ nhận item hợp lệ
    const nextCart = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (!val || typeof val !== "object") continue;
      const productId = Number(val.productId);
      const quantity = Number(val.quantity);
      if (!Number.isInteger(productId) || productId <= 0) continue;
      if (!Number.isInteger(quantity) || quantity <= 0) continue;
      if (!findProductById(productId)) continue;
      nextCart[String(productId)] = { productId, quantity };
    }
    cart = nextCart;
  } catch (e) {
    // dữ liệu corrupt -> reset
    cart = {};
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}


productsGridEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action !== "add-to-cart") return;
  const productId = Number(btn.dataset.productId);
  addToCart(productId);
});

cartTbodyEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  const productId = Number(btn.dataset.productId);

  if (action === "inc") incQty(productId);
  if (action === "dec") decQty(productId);
  if (action === "remove") removeFromCart(productId);
});

clearCartBtn.addEventListener("click", () => {
  if (!getCartItems().length) {
    alert("Giỏ hàng đang trống.");
    return;
  }
  clearCart();
});


function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlAttr(str) {
  return escapeHtml(str);
}


loadCart();
renderProducts();
renderCart();
