import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "₹";
  const delivery_fee = 0;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  // 🔄 States
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState({});
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // 🌟 Wishlist - Load & Save
  useEffect(() => {
    const stored = localStorage.getItem("wishlist");
    if (stored) setWishlist(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (id) => {
    if (!wishlist.includes(id)) {
      setWishlist((prev) => [...prev, id]);
      toast.success("Added to Wishlist");
    }
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((itemId) => itemId !== id));
    toast.info("Removed from Wishlist");
  };

  // 🛒 Cart Management
  const addToCart = async (itemId, size, quantity = 1) => {
    if (!size) return toast.error("Select Product Size");

    const updatedCart = JSON.parse(JSON.stringify(cartItems));
    updatedCart[itemId] = updatedCart[itemId] || {};
    updatedCart[itemId][size] = (updatedCart[itemId][size] || 0) + quantity;

    setCartItems(updatedCart);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.error(error);
        toast.error("Failed to sync with server");
      }
    }

    toast.success("Added to Cart");
  };

  const updateQuantity = async (itemId, size, quantity) => {
    const updatedCart = JSON.parse(JSON.stringify(cartItems));

    if (updatedCart[itemId]) {
      if (quantity > 0) {
        updatedCart[itemId][size] = quantity;
      } else {
        delete updatedCart[itemId][size];
        if (Object.keys(updatedCart[itemId]).length === 0) {
          delete updatedCart[itemId];
        }
      }
    }

    setCartItems(updatedCart);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.error(error);
        toast.error();
      }
    }
  };

  const getCartCount = () =>
    Object.values(cartItems).reduce(
      (count, sizes) =>
        count + Object.values(sizes).reduce((sum, qty) => sum + qty, 0),
      0
    );

  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, sizes]) => {
      const product = products.find((p) => p._id === itemId);
      if (!product) return total;
      const itemTotal = Object.values(sizes).reduce(
        (sum, qty) => sum + product.price * qty,
        0
      );
      return total + itemTotal;
    }, 0);
  };

  const getFirstCartItemImage = () => {
    for (const itemId of Object.keys(cartItems)) {
      const product = products.find((p) => p._id === itemId);
      if (product?.image) return product.image;
    }
    return null;
  };

  // 🌟 Reviews
  const addReview = async (productId, reviewData) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/review/add`,
        { productId, review: reviewData },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Review added!");
        getProductReviews(productId);
      } else {
        toast.error(res.data.message || "Review failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Review error");
    }
  };

  const getProductReviews = async (productId) => {
    try {
      const res = await axios.get(`${backendUrl}/api/review/${productId}`);
      if (res.data.success) {
        setReviews((prev) => ({ ...prev, [productId]: res.data.reviews }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching reviews");
    }
  };

  // 📦 Fetch Products
  const getProductsData = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/list`);
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (error) {
      console.error(error);
      toast.error();
    }
  };

  // 🛒 Fetch User Cart
  const getUserCart = async (authToken) => {
    try {
      const res = await axios.get(`${backendUrl}/api/cart`, {
        headers: { token: authToken },
      });
      if (res.data.success) {
        setCartItems(res.data.cartItems || {});
      }
    } catch (error) {
      console.error(error);
      toast.error();
    }
  };

  // 🚀 App Init
  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!token && storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) getUserCart(token);
  }, [token]);

  // 🧠 Context Value
  const contextValue = {
    currency,
    delivery_fee,
    backendUrl,
    navigate,
    token,
    setToken,
    products,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    updateQuantity,
    getCartCount,
    getCartAmount,
    setCartItems,
    getFirstCartItemImage,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    reviews,
    addReview,
    getProductReviews,
    promoCode,
    setPromoCode,
    discount,
    setDiscount,
  };

  return (
    <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;