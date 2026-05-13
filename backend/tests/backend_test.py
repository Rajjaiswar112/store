"""
Zenkai backend API tests.
Covers: health, products (list/filter/search/categories/CRUD/admin guard),
auth (register/login/me/logout/refresh), cart, wishlist, checkout (Stripe),
orders, admin analytics/orders, newsletter, auth guards (401/403).
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://zenkai-merch.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@zenkai.com"
ADMIN_PASSWORD = "ZenkaiAdmin@2026"


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="session")
def user_session():
    s = requests.Session()
    email = f"testuser_{uuid.uuid4().hex[:8]}@zenkai.com"
    r = s.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": "TestUser@2026"}, timeout=15)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    s.email = email  # attach for later
    return s


@pytest.fixture(scope="session")
def any_product():
    r = requests.get(f"{API}/products", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0, "no seeded products"
    return items[0]


# ---------- Health ----------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == "Zenkai API"
        assert "tagline" in d


# ---------- Products ----------
class TestProducts:
    def test_list_products(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 15
        # _id should not be present
        for p in items[:3]:
            assert "_id" not in p
            assert "id" in p and "name" in p and "price" in p

    def test_filter_category(self):
        r = requests.get(f"{API}/products", params={"category": "acrylic_plaques"}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        assert all(p["category"] == "acrylic_plaques" for p in items)

    def test_search_naruto(self):
        r = requests.get(f"{API}/products", params={"search": "naruto"}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 1
        assert any("naruto" in (p.get("name", "") + p.get("anime", "")).lower() for p in items)

    def test_trending(self):
        r = requests.get(f"{API}/products", params={"trending": "true"}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        assert all(p.get("trending") is True for p in items)

    def test_best_seller(self):
        r = requests.get(f"{API}/products", params={"best_seller": "true"}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        assert all(p.get("best_seller") is True for p in items)

    def test_new_arrival(self):
        r = requests.get(f"{API}/products", params={"new_arrival": "true"}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        assert all(p.get("new_arrival") is True for p in items)

    def test_featured(self):
        r = requests.get(f"{API}/products", params={"featured": "true"}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        assert all(p.get("featured") is True for p in items)

    def test_categories(self):
        r = requests.get(f"{API}/products/categories", timeout=15)
        assert r.status_code == 200
        cats = r.json()
        assert len(cats) == 5
        slugs = {c["slug"] for c in cats}
        assert slugs == {"acrylic_plaques", "led_frames", "posters", "manga_canvas", "neon_collectibles"}

    def test_single_product(self, any_product):
        r = requests.get(f"{API}/products/{any_product['id']}", timeout=15)
        assert r.status_code == 200
        p = r.json()
        assert p["id"] == any_product["id"]
        assert p["name"] == any_product["name"]

    def test_single_product_404(self):
        r = requests.get(f"{API}/products/nonexistent-id-xyz", timeout=15)
        assert r.status_code == 404


# ---------- Auth ----------
class TestAuth:
    def test_login_admin(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"
        # cookie set
        assert "access_token" in r.cookies or any(c.name == "access_token" for c in r.cookies)

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_register_and_me(self):
        s = requests.Session()
        email = f"reg_{uuid.uuid4().hex[:8]}@zenkai.com"
        r = s.post(f"{API}/auth/register", json={"name": "Reg User", "email": email, "password": "Pass@1234"}, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == email
        assert d["role"] == "user"
        # /me with cookie
        me = s.get(f"{API}/auth/me", timeout=15)
        assert me.status_code == 200
        assert me.json()["email"] == email

    def test_register_duplicate(self, user_session):
        r = requests.post(f"{API}/auth/register",
                          json={"name": "Dup", "email": user_session.email, "password": "Pass@1234"}, timeout=15)
        assert r.status_code == 400

    def test_me_unauth(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_logout(self, user_session):
        # ensure logged in
        me = user_session.get(f"{API}/auth/me", timeout=15)
        assert me.status_code == 200
        r = user_session.post(f"{API}/auth/logout", timeout=15)
        assert r.status_code == 200
        # cookies cleared - new session needed for further tests
        # re-login
        login = user_session.post(f"{API}/auth/login",
                                  json={"email": user_session.email, "password": "TestUser@2026"}, timeout=15)
        assert login.status_code == 200


# ---------- Cart ----------
class TestCart:
    def test_cart_requires_auth(self):
        r = requests.get(f"{API}/cart", timeout=15)
        assert r.status_code == 401

    def test_cart_flow(self, user_session, any_product):
        pid = any_product["id"]
        # add
        r = user_session.post(f"{API}/cart", json={"product_id": pid, "quantity": 2}, timeout=15)
        assert r.status_code == 200
        # get
        r = user_session.get(f"{API}/cart", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert any(it["product_id"] == pid and it["quantity"] >= 2 for it in d["items"])
        assert any("product" in it and it["product"]["id"] == pid for it in d["items"])
        # update
        r = user_session.put(f"{API}/cart/{pid}", json={"product_id": pid, "quantity": 5}, timeout=15)
        assert r.status_code == 200
        r = user_session.get(f"{API}/cart", timeout=15)
        assert any(it["product_id"] == pid and it["quantity"] == 5 for it in r.json()["items"])
        # delete
        r = user_session.delete(f"{API}/cart/{pid}", timeout=15)
        assert r.status_code == 200
        r = user_session.get(f"{API}/cart", timeout=15)
        assert not any(it["product_id"] == pid for it in r.json()["items"])


# ---------- Wishlist ----------
class TestWishlist:
    def test_wishlist_requires_auth(self):
        r = requests.get(f"{API}/wishlist", timeout=15)
        assert r.status_code == 401

    def test_wishlist_toggle(self, user_session, any_product):
        pid = any_product["id"]
        r = user_session.post(f"{API}/wishlist/{pid}", timeout=15)
        assert r.status_code == 200
        first = r.json()
        assert "added" in first
        r = user_session.get(f"{API}/wishlist", timeout=15)
        assert r.status_code == 200
        d = r.json()
        if first["added"]:
            assert pid in d["product_ids"]
        # toggle again
        r2 = user_session.post(f"{API}/wishlist/{pid}", timeout=15)
        assert r2.status_code == 200
        assert r2.json()["added"] != first["added"]


# ---------- Checkout ----------
class TestCheckout:
    def test_checkout_requires_auth(self):
        r = requests.post(f"{API}/checkout/session", json={"origin_url": BASE_URL}, timeout=15)
        assert r.status_code == 401

    def test_checkout_empty_cart(self, user_session):
        # ensure cart empty
        user_session.delete(f"{API}/cart", timeout=15)
        r = user_session.post(f"{API}/checkout/session", json={"origin_url": BASE_URL}, timeout=15)
        assert r.status_code == 400

    def test_create_checkout_session(self, user_session, any_product):
        # add a product
        user_session.post(f"{API}/cart", json={"product_id": any_product["id"], "quantity": 1}, timeout=15)
        r = user_session.post(f"{API}/checkout/session", json={"origin_url": BASE_URL}, timeout=30)
        assert r.status_code == 200, f"checkout failed: {r.status_code} {r.text}"
        d = r.json()
        assert "url" in d and d["url"].startswith("http")
        assert "session_id" in d and len(d["session_id"]) > 0
        # status check
        sid = d["session_id"]
        st = user_session.get(f"{API}/checkout/status/{sid}", timeout=30)
        assert st.status_code == 200
        s = st.json()
        assert "payment_status" in s
        assert "status" in s


# ---------- Orders ----------
class TestOrders:
    def test_orders_requires_auth(self):
        r = requests.get(f"{API}/orders", timeout=15)
        assert r.status_code == 401

    def test_user_orders(self, user_session):
        r = user_session.get(f"{API}/orders", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Admin ----------
class TestAdmin:
    def test_admin_analytics(self, admin_session):
        r = admin_session.get(f"{API}/admin/analytics", timeout=20)
        assert r.status_code == 200
        d = r.json()
        for k in ("total_revenue", "total_orders", "total_products", "total_users",
                  "revenue_by_category", "recent_orders"):
            assert k in d

    def test_admin_orders(self, admin_session):
        r = admin_session.get(f"{API}/admin/orders", timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_forbidden_for_user(self, user_session):
        r = user_session.get(f"{API}/admin/analytics", timeout=15)
        assert r.status_code == 403
        r2 = user_session.get(f"{API}/admin/orders", timeout=15)
        assert r2.status_code == 403

    def test_admin_unauth(self):
        r = requests.get(f"{API}/admin/analytics", timeout=15)
        assert r.status_code == 401

    def test_product_crud_admin(self, admin_session):
        # create
        payload = {
            "name": "TEST_admin_product",
            "description": "test product",
            "price": 12.34,
            "category": "posters",
            "images": ["https://example.com/img.png"],
            "stock": 5,
            "anime": "Test Anime",
            "tags": ["test"],
            "featured": False, "trending": False, "best_seller": False, "new_arrival": True,
        }
        r = admin_session.post(f"{API}/products", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["name"] == "TEST_admin_product"
        assert "_id" not in created
        pid = created["id"]

        # GET persisted
        g = requests.get(f"{API}/products/{pid}", timeout=15)
        assert g.status_code == 200
        assert g.json()["price"] == 12.34

        # update
        u = admin_session.put(f"{API}/products/{pid}", json={"price": 19.99, "stock": 10}, timeout=15)
        assert u.status_code == 200
        assert u.json()["price"] == 19.99

        # GET verify update
        g2 = requests.get(f"{API}/products/{pid}", timeout=15)
        assert g2.json()["price"] == 19.99
        assert g2.json()["stock"] == 10

        # delete
        d = admin_session.delete(f"{API}/products/{pid}", timeout=15)
        assert d.status_code == 200
        g3 = requests.get(f"{API}/products/{pid}", timeout=15)
        assert g3.status_code == 404

    def test_product_create_forbidden(self, user_session):
        payload = {"name": "x", "price": 1.0, "category": "posters"}
        r = user_session.post(f"{API}/products", json=payload, timeout=15)
        assert r.status_code == 403

    def test_product_create_unauth(self):
        r = requests.post(f"{API}/products", json={"name": "x", "price": 1.0, "category": "posters"}, timeout=15)
        assert r.status_code == 401


# ---------- Newsletter ----------
class TestNewsletter:
    def test_newsletter_subscribe(self):
        email = f"news_{uuid.uuid4().hex[:8]}@zenkai.com"
        r = requests.post(f"{API}/newsletter", json={"email": email}, timeout=15)
        assert r.status_code == 200
        assert r.json()["ok"] is True
        # duplicate
        r2 = requests.post(f"{API}/newsletter", json={"email": email}, timeout=15)
        assert r2.status_code == 200
        assert r2.json().get("already") is True
