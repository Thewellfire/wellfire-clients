import axios from "axios";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { backendUrl } from "../config/constants";

const ListInvestmentProducts = ({ token }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        category: "",
        status: "",
    });
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusData, setStatusData] = useState({ productStatus: "" });

    // Modal states
    const [showFundingModal, setShowFundingModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [fundingData, setFundingData] = useState({
        currentFunding: 0,
        totalInvestors: 0,
        fundingDeadline: "",
        fundingStatus: "active",
    });
    const [budgetData, setBudgetData] = useState({
        totalBudget: 0,
    });

    // Analytics states
    const [analytics, setAnalytics] = useState({
        totalProducts: 0,
        totalFunding: 0,
        activeFunding: 0,
        completedProjects: 0,
        averageFunding: 0,
    });

    // View mode
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"

    // Pagination states
    const [totalProducts, setTotalProducts] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);

    // Enhanced fetch products with pagination
    const fetchProducts = useCallback(async(page = 1, showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setIsNavigating(true);
            }

            const params = new URLSearchParams({
                page,
                limit: 500,
                search: searchTerm,
                ...filters,
            });

            const response = await axios.get(
                `${backendUrl}/api/investment-product/list?${params}`, { headers: { token } }
            );

            if (response.data.success) {
                console.log('API Response:', response.data);
                console.log('Products received:', response.data.products ? response.data.products.length : 0);
                console.log('Pagination info:', response.data.pagination);

                setProducts(response.data.products || []);
                setCurrentPage(response.data.pagination ? response.data.pagination.currentPage : 1);
                setTotalPages(response.data.pagination ? response.data.pagination.totalPages : 1);
                setTotalProducts(response.data.pagination ? response.data.pagination.totalProducts : (response.data.products ? response.data.products.length : 0));

                // Update URL without page reload
                const url = new URL(window.location);
                url.searchParams.set('page', page);
                window.history.replaceState({}, '', url);
            }
        } catch (error) {
            console.error("Fetch products error:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response ? error.response.data : null,
                status: error.response ? error.response.status : null,
                url: `${backendUrl}/api/investment-product/list`
            });
            toast.error(`Failed to fetch products: ${error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message}`);
        } finally {
            setLoading(false);
            setIsNavigating(false);
        }
    }, [searchTerm, filters, token]);

    // Fetch analytics
    const fetchAnalytics = useCallback(async() => {
        try {
            const response = await axios.get(
                `${backendUrl}/api/investment-product/admin/analytics`, { headers: { token } }
            );

            if (response.data.success) {
                setAnalytics(response.data.analytics || {});
            }
        } catch (error) {
            console.error("Fetch analytics error:", error);
        }
    }, [token]);

    // Update product actions
    const toggleFeatured = async(productId, isFeatured) => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/investment-product/${productId}`, { isFeatured: !isFeatured }, { headers: { token } }
            );

            if (response.data.success) {
                toast.success(isFeatured ? "Product unfeatured" : "Product featured");
                fetchProducts(currentPage);
            }
        } catch (error) {
            toast.error("Failed to update featured status");
        }
    };

    const toggleActive = async(productId, isActive) => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/investment-product/${productId}`, { isActive: !isActive }, { headers: { token } }
            );

            if (response.data.success) {
                toast.success(isActive ? "Product deactivated" : "Product activated");
                fetchProducts(currentPage);
            }
        } catch (error) {
            toast.error("Failed to update active status");
        }
    };

    const handleDelete = async(productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await axios.delete(
                `${backendUrl}/api/investment-product/${productId}`, { headers: { token } }
            );

            if (response.data.success) {
                toast.success("Product deleted successfully");
                fetchProducts(currentPage);
                fetchAnalytics();
            }
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const updateFundingProgress = async(productId, fundingData) => {
        try {
            // Validate before sending to backend
            if (fundingData.currentFunding < 0) {
                toast.error("Funding cannot be negative");
                return;
            }

            if (selectedProduct && fundingData.currentFunding > selectedProduct.totalBudget) {
                toast.error(`Funding cannot exceed total budget of ₹${selectedProduct.totalBudget}`);
                return;
            }

            const response = await axios.put(
                `${backendUrl}/api/investment-product/${productId}/funding`,
                fundingData, { headers: { token } }
            );

            if (response.data.success) {
                toast.success("Funding updated successfully!");

                // Update local products state immediately so remaining amount updates
                setProducts((prevProducts) =>
                    prevProducts.map((product) =>
                        product._id === productId ?
                        {
                            ...product,
                            currentFunding: fundingData.currentFunding,
                            totalInvestors: fundingData.totalInvestors || product.totalInvestors,
                            fundingStatus: fundingData.fundingStatus || product.fundingStatus
                        } :
                        product
                    )
                );

                // Update selected product so modal preview shows new values instantly
                if (selectedProduct && selectedProduct._id === productId) {
                    setSelectedProduct({
                        ...selectedProduct,
                        currentFunding: fundingData.currentFunding,
                        totalInvestors: fundingData.totalInvestors || selectedProduct.totalInvestors,
                        fundingStatus: fundingData.fundingStatus || selectedProduct.fundingStatus
                    });
                }

                fetchAnalytics();
                setShowFundingModal(false);
            } else {
                toast.error(response.data.message || "Failed to update funding");
            }
        } catch (error) {
            console.error("Update funding error:", error);
            toast.error(
                (error.response && error.response.data && error.response.data.message) ||
                (error.response && error.response.data && error.response.data.error) ||
                error.message ||
                "Failed to update funding. Please try again."
            );
        }
    };

    const updateTotalBudget = async(productId, budgetData) => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/investment-product/${productId}`,
                budgetData, { headers: { token } }
            );

            if (response.data.success) {
                toast.success("Total Budget updated successfully!");

                // Update local products state immediately so Goal displays new value
                setProducts((prevProducts) =>
                    prevProducts.map((product) =>
                        product._id === productId ? {...product, totalBudget: budgetData.totalBudget } :
                        product
                    )
                );

                // Update selected product so modal preview shows new Goal instantly
                if (selectedProduct && selectedProduct._id === productId) {
                    setSelectedProduct({
                        ...selectedProduct,
                        totalBudget: budgetData.totalBudget
                    });
                }

                fetchAnalytics();
                setShowBudgetModal(false);
            } else {
                toast.error(response.data.message || "Failed to update budget");
            }
        } catch (error) {
            console.error("Update budget error:", error);
            toast.error(
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                "Failed to update budget. Please try again."
            );
        }
    };

    // Enhanced pagination handlers
    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            fetchProducts(page, false);
        }
    }, [totalPages, currentPage, fetchProducts]);

    // Helper functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount);
    };

    const calculateFundingPercentage = (current, total) => {
        if (total <= 0) return 0;
        return Math.min((current / total) * 100, 100);
    };

    const getStatusColor = (status) => {
        const colors = {
            funding: "bg-blue-500",
            "in-production": "bg-orange-500",
            completed: "bg-green-500",
            cancelled: "bg-red-500",
        };
        return colors[status] || "bg-gray-500";
    };

    const openFundingModal = (product) => {
        setSelectedProduct(product);
        setFundingData({
            currentFunding: product.currentFunding || 0,
            totalInvestors: product.totalInvestors || 0,
            fundingDeadline: product.fundingDeadline || "",
            fundingStatus: product.fundingStatus || "active",
        });
        setShowFundingModal(true);
    };

    const openDetailsModal = (product) => {
        setSelectedProduct(product);
        setShowDetailsModal(true);
    };

    const openBudgetModal = (product) => {
        setSelectedProduct(product);
        setBudgetData({
            totalBudget: product.totalBudget || 0,
        });
        setShowBudgetModal(true);
    };

    const openStatusModal = (product) => {
        setSelectedProduct(product);
        setStatusData({ productStatus: product.productStatus || "funding" });
        setShowStatusModal(true);
    };

    const updateProductStatus = async(productId, newStatus) => {
        try {
            console.log("Updating product status:", { productId, newStatus });

            const response = await axios.put(
                `${backendUrl}/api/investment-product/${productId}/status`, { productStatus: newStatus }, { headers: { token } }
            );

            if (response.data.success) {
                toast.success(`Product status updated to ${newStatus}!`);

                // Update local products state immediately
                setProducts((prevProducts) =>
                    prevProducts.map((product) =>
                        product._id === productId ? {...product, productStatus: newStatus } :
                        product
                    )
                );

                // Update selected product if it's the one being edited
                if (selectedProduct && selectedProduct._id === productId) {
                    setSelectedProduct({
                        ...selectedProduct,
                        productStatus: newStatus
                    });
                }

                fetchAnalytics();
                setShowStatusModal(false);
            } else {
                toast.error(response.data.message || "Failed to update product status");
            }
        } catch (error) {
            console.error("Update product status error:", error);
            console.error("Error response:", error.response && error.response.data);
            toast.error(
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                "Failed to update product status. Please try again."
            );
        }
    };

    const removeProduct = async(productId) => {
        if (window.confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) {
            try {
                console.log("Deleting product:", productId);

                const response = await axios.delete(
                    `${backendUrl}/api/investment-product/${productId}`, { headers: { token } }
                );

                console.log("Delete response:", response.data);

                if (response.data.success) {
                    toast.success("Product deleted successfully!");

                    // Immediately remove from local state so it disappears from the admin list
                    setProducts((prevProducts) =>
                        prevProducts.filter((product) => product._id !== productId)
                    );

                    // Refresh the full list to ensure deleted product doesn't reappear
                    setTimeout(() => {
                        fetchProducts(currentPage);
                        fetchAnalytics();
                    }, 500);
                } else {
                    console.error("Delete failed - success is false:", response.data);
                    toast.error(response.data.message || "Failed to delete product");
                }
            } catch (error) {
                console.error("Delete product error:", error);
                console.error("Error response:", error.response && error.response.data);
                console.error("Error status:", error.response && error.response.status);

                // Show the actual backend error message
                toast.error(
                    (error.response && error.response.data && error.response.data.message) ||
                    error.message ||
                    "Failed to delete product. Please try again."
                );
            }
        }
    };

    // Initialize from URL parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageFromUrl = parseInt(urlParams.get('page')) || 1;
        setCurrentPage(pageFromUrl);
        fetchProducts(pageFromUrl);
        fetchAnalytics();
    }, [fetchProducts, fetchAnalytics]);

    // Auto-refresh products when filters change
    useEffect(() => {
        fetchProducts(1);
    }, [searchTerm, filters, fetchProducts]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' && currentPage > 1) {
                e.preventDefault();
                handlePageChange(currentPage - 1);
            } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
                e.preventDefault();
                handlePageChange(currentPage + 1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                handlePageChange(1);
            } else if (e.key === 'End') {
                e.preventDefault();
                handlePageChange(totalPages);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, totalPages, handlePageChange]);

    if (loading && products.length === 0) {
        return ( <
            div className = "flex justify-center items-center h-screen" >
            <
            div className = "animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" / >
            <
            /div>
        );
    }

    return ( <
        div className = "min-h-screen bg-white" > { /* Header Section */ } <
        div className = "bg-black text-white shadow-2xl border-b-4 border-white" >
        <
        div className = "max-w-7xl mx-auto px-6 lg:px-8 py-8" >
        <
        div className = "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6" >
        <
        div >
        <
        div className = "flex items-center gap-4 mb-4" >
        <
        div className = "bg-white text-black px-4 py-2 font-bold text-lg tracking-wider" >
        WELLFIRE <
        /div> <
        div className = "bg-gray-800 text-white px-3 py-1 text-sm font-bold tracking-wider border border-gray-600" >
        ADMIN <
        /div> < /
        div > <
        h1 className = "text-4xl font-bold text-white tracking-tight mb-3" >
        Investment Products <
        /h1> <
        p className = "text-gray-300 text-lg font-medium max-w-2xl" >
        Manage your investment portfolio with precision and control <
        /p> < /
        div > <
        div className = "flex flex-col sm:flex-row gap-4" >
        <
        button onClick = {
            () => setViewMode(viewMode === "grid" ? "table" : "grid")
        }
        className = "px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition-all duration-200 font-bold text-sm" > { viewMode === "grid" ? "TABLE VIEW" : "GRID VIEW" } <
        /button> <
        button onClick = {
            () => window.location.href = '/add'
        }
        className = "px-8 py-4 bg-white text-black rounded-none hover:bg-gray-200 transition-all duration-200 font-bold text-lg border-2 border-white shadow-lg hover:shadow-xl flex items-center gap-3 group" >
        <
        svg className = "w-6 h-6 group-hover:rotate-90 transition-transform duration-200"
        fill = "none"
        stroke = "currentColor"
        viewBox = "0 0 24 24" >
        <
        path strokeLinecap = "round"
        strokeLinejoin = "round"
        strokeWidth = "2"
        d = "M12 4v16m8-8H4" /
        >
        <
        /svg> <
        span className = "tracking-wider" > ADD NEW PRODUCT < /span> < /
        button > <
        /div> < /
        div > <
        /div> < /
        div >

        <
        div className = "max-w-7xl mx-auto px-6 lg:px-8 py-10" > { /* Search and Filters */ } <
        div className = "bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8" >
        <
        div className = "flex flex-col lg:flex-row gap-4" >
        <
        div className = "flex-1" >
        <
        div className = "relative" >
        <
        input type = "text"
        placeholder = "Search products by title, artist, or description..."
        value = { searchTerm }
        onChange = {
            (e) => setSearchTerm(e.target.value)
        }
        className = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /
        >
        <
        span className = "absolute left-3 top-3 text-gray-400 text-xl" > 🔍 < /span> < /
        div > <
        /div>

        <
        div className = "flex flex-wrap gap-4 items-center" >
        <
        select value = { filters.category }
        onChange = {
            (e) => {
                const newFilters = {...filters, category: e.target.value };
                setFilters(newFilters);
                setCurrentPage(1);
            }
        }
        className = "px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" >
        <
        option value = "" > All Categories < /option> <
        option value = "Music" > Music < /option> <
        option value = "Film" > Film < /option> <
        option value = "Documentary" > Documentary < /option> <
        option value = "Web Series" > Web Series < /option> <
        option value = "Upcoming Projects" > Upcoming Projects < /option> <
        option value = "Media Production" > Media Production < /option> <
        option value = "Line Production Services" > Line Production Services < /option> <
        option value = "Government Subsidy Guidance" > Government Subsidy Guidance < /option> <
        option value = "Other" > Other < /option> < /
        select >

        <
        select value = { filters.status }
        onChange = {
            (e) => {
                const newFilters = {...filters, status: e.target.value };
                setFilters(newFilters);
                setCurrentPage(1);
            }
        }
        className = "px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" >
        <
        option value = "" > All Status < /option> <
        option value = "funding" > Funding < /option> <
        option value = "in-production" > In Production < /option> <
        option value = "completed" > Completed < /option> <
        option value = "cancelled" > Cancelled < /option> < /
        select > <
        /div> < /
        div > <
        /div>

        { /* Products Display */ } <
        div className = "mb-4" >
        <
        p className = "text-sm text-gray-600" >
        Displaying { products.length }
        products { products.length === 0 && !loading && "(No products found - check console for API response)" } <
        /p> < /
        div >

        {
            viewMode === "grid" ? ( <
                div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4" > {
                    products.map((product) => ( <
                        div key = { product._id }
                        className = "bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden group" > { /* Product Image */ } <
                        div className = "relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden" > {
                            product.coverImage ? ( <
                                img src = { product.coverImage }
                                alt = { product.productTitle }
                                className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /
                                >
                            ) : ( <
                                div className = "w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-100" >
                                No Image <
                                /div>
                            )
                        }

                        { /* Status Badge */ } <
                        div className = "absolute top-3 left-3" >
                        <
                        span className = { `px-2 py-1 rounded-full text-[10px] font-semibold text-white shadow-lg ${getStatusColor(
                                                product.productStatus
                                            )}` } > { product.productStatus.toUpperCase() } <
                        /span> < /
                        div >

                        { /* Featured Badge */ } {
                            product.isFeatured && ( <
                                div className = "absolute top-3 right-3" >
                                <
                                span className = "bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-semibold shadow-lg" >
                                FEATURED <
                                /span> < /
                                div >
                            )
                        } <
                        /div>

                        { /* Product Content */ } <
                        div className = "p-4 space-y-3" >
                        <
                        div className = "space-y-1" >
                        <
                        h3 className = "text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors" > { product.productTitle } <
                        /h3> <
                        p className = "text-blue-600 text-[10px] font-semibold" >
                        by { product.artistName } <
                        /p> <
                        p className = "text-gray-600 text-[10px]" > { product.category } { product.genre && ` • ${product.genre}` } <
                        /p> < /
                        div >

                        { /* Funding Progress */ } <
                        div className = "bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded border border-blue-100" >
                        <
                        div className = "text-[9px] text-gray-700 mb-1" >
                        <
                        div >
                        <
                        span className = "font-medium" > Goal: < /span> <
                        span className = "text-blue-600 font-semibold ml-1" > { formatCurrency(product.totalBudget) } <
                        /span> < /
                        div > <
                        div className = "text-red-600 font-medium" > { formatCurrency((product.totalBudget - (product.currentFunding || 0)).toFixed(0)) }
                        remaining <
                        /div> < /
                        div > <
                        div className = "w-full bg-white rounded-full h-2 shadow-inner hover:shadow-md transition-all duration-300 cursor-pointer" >
                        <
                        div className = "bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-lg"
                        style = {
                            {
                                width: `${Math.max(
                                                        1,
                                                        calculateFundingPercentage(
                                                            product.currentFunding || 0,
                                                            product.totalBudget
                                                        )
                                                    )}%`,
                            }
                        }
                        /> < /
                        div > <
                        /div>

                        { /* Product Status */ } <
                        div className = "flex items-center justify-between mb-2" >
                        <
                        span className = "text-[10px] text-gray-600 font-medium" > Status: < /span> <
                        button onClick = {
                            () => openStatusModal(product)
                        }
                        className = { `px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all duration-200 hover:scale-105 ${
                                                product.productStatus === 'completed'
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : product.productStatus === 'funding'
                                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                    : product.productStatus === 'in-production'
                                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }` } > {
                            product.productStatus === 'completed' ?
                            'Completed' : product.productStatus === 'funding' ?
                                'Funding' : product.productStatus === 'in-production' ?
                                'In Production' : product.productStatus === 'cancelled' ?
                                'Cancelled' : product.productStatus || 'Unknown'
                        } <
                        /button> < /
                        div >

                        { /* Action Buttons */ } <
                        div className = "flex flex-col gap-2" >
                        <
                        div className = "flex gap-2" >
                        <
                        button onClick = {
                            () => openDetailsModal(product)
                        }
                        className = "flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1 px-1.5 rounded text-[9px] font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md" >
                        Details <
                        /button> <
                        button onClick = {
                            () => openFundingModal(product)
                        }
                        className = "flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-1 px-1.5 rounded text-[9px] font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md" >
                        Manage <
                        /button> <
                        button onClick = {
                            () => removeProduct(product._id)
                        }
                        className = "flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-1 px-1.5 rounded text-[9px] font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-sm hover:shadow-md" >
                        Delete <
                        /button> < /
                        div > <
                        button onClick = {
                            () => openBudgetModal(product)
                        }
                        className = "w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-1 px-1.5 rounded text-[9px] font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow-md" >
                        Edit Total Budget(₹) <
                        /button> < /
                        div > <
                        /div> < /
                        div >
                    ))
                } <
                /div>
            ) : ( <
                div className = "bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden" >
                <
                div className = "overflow-x-auto" >
                <
                table className = "w-full" >
                <
                thead className = "bg-gray-50" >
                <
                tr >
                <
                th className = "text-left py-3 px-4 font-semibold text-gray-900 text-sm" >
                Product <
                /th> <
                th className = "text-left py-3 px-4 font-semibold text-gray-900 text-sm" >
                Category <
                /th> <
                th className = "text-left py-3 px-4 font-semibold text-gray-900 text-sm" >
                Status <
                /th> <
                th className = "text-left py-3 px-4 font-semibold text-gray-900 text-sm" >
                Funding <
                /th> <
                th className = "text-left py-3 px-4 font-semibold text-gray-900 text-sm" >
                Actions <
                /th> < /
                tr > <
                /thead> <
                tbody className = "divide-y divide-gray-200" > {
                    products.map((product) => ( <
                        tr key = { product._id }
                        className = "hover:bg-gray-50" >
                        <
                        td className = "py-3 px-4" >
                        <
                        div className = "flex items-center" >
                        <
                        img src = { product.coverImage || "/placeholder.png" }
                        alt = { product.productTitle }
                        className = "w-8 h-8 rounded object-cover mr-3" /
                        >
                        <
                        div >
                        <
                        div className = "font-semibold text-gray-900 text-sm" > { product.productTitle } <
                        /div> <
                        div className = "text-xs text-gray-600" >
                        by { product.artistName } <
                        /div> < /
                        div > <
                        /div> < /
                        td > <
                        td className = "py-3 px-4" >
                        <
                        span className = "px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs" > { product.category } <
                        /span> < /
                        td > <
                        td className = "py-3 px-4" >
                        <
                        span className = { `px-2 py-0.5 rounded-full text-xs font-semibold text-white ${getStatusColor(
                                                        product.productStatus
                                                    )}` } > { product.productStatus } <
                        /span> < /
                        td > <
                        td className = "py-3 px-4" >
                        <
                        div className = "text-xs" >
                        <
                        div className = "font-semibold text-green-600" > { formatCurrency(product.currentFunding || 0) } <
                        /div> <
                        div className = "text-gray-600" >
                        of { formatCurrency(product.totalBudget) } <
                        /div> <
                        div className = "w-16 bg-gray-200 rounded-full h-1 mt-1" >
                        <
                        div className = "bg-green-500 h-1 rounded-full"
                        style = {
                            {
                                width: `${calculateFundingPercentage(
                                                                    product.currentFunding || 0,
                                                                    product.totalBudget
                                                                )}%`,
                            }
                        }
                        /> < /
                        div > <
                        /div> < /
                        td > <
                        td className = "py-3 px-4" >
                        <
                        div className = "flex flex-col gap-1" >
                        <
                        div className = "flex gap-1" >
                        <
                        button onClick = {
                            () => openDetailsModal(product)
                        }
                        className = "bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs hover:bg-blue-200" >
                        View <
                        /button> <
                        button onClick = {
                            () => openFundingModal(product)
                        }
                        className = "bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs hover:bg-green-200" >
                        Manage <
                        /button> < /
                        div > <
                        button onClick = {
                            () => openBudgetModal(product)
                        }
                        className = "bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs hover:bg-purple-200 w-full" >
                        Edit Budget <
                        /button> < /
                        div > <
                        /td> < /
                        tr >
                    ))
                } <
                /tbody> < /
                table > <
                /div> < /
                div >
            )
        }

        { /* Empty State */ } {
            products.length === 0 && !loading && ( <
                div className = "text-center py-12" >
                <
                div className = "text-6xl mb-4" > 📭 < /div> <
                h3 className = "text-xl font-semibold text-gray-900 mb-2" >
                No products found <
                /h3> <
                p className = "text-gray-600 mb-6" >
                Try adjusting your search or filters <
                /p> <
                button onClick = {
                    () => (window.location.href = "/add")
                }
                className = "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700" >
                Add Your First Product <
                /button> < /
                div >
            )
        }

        { /* Modals - Funding Modal */ } {
            showFundingModal && selectedProduct && ( <
                div className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" >
                <
                div className = "bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" >
                <
                div className = "flex justify-between items-center mb-6" >
                <
                h3 className = "text-2xl font-bold text-gray-900" >
                Manage Funding <
                /h3> <
                button onClick = {
                    () => setShowFundingModal(false)
                }
                className = "text-gray-400 hover:text-gray-600 text-2xl" > ✕
                <
                /button> < /
                div >

                <
                div className = "mb-6" >
                <
                h4 className = "font-semibold text-lg" > { selectedProduct.productTitle } < /h4> <
                p className = "text-gray-600" > by { selectedProduct.artistName } < /p> < /
                div >

                <
                div className = "space-y-6" >
                <
                div >
                <
                label className = "block text-sm font-semibold text-gray-700 mb-2" >
                Current Funding(₹) <
                /label> <
                input type = "number"
                value = { fundingData.currentFunding === 0 ? '' : fundingData.currentFunding }
                onChange = {
                    (e) => {
                        const value = parseFloat(e.target.value) || 0;
                        // Prevent funding from exceeding total budget
                        if (value > selectedProduct.totalBudget) {
                            toast.warning(`Funding cannot exceed total budget of ₹${selectedProduct.totalBudget}`);
                            setFundingData({
                                ...fundingData,
                                currentFunding: selectedProduct.totalBudget,
                            });
                        } else {
                            setFundingData({
                                ...fundingData,
                                currentFunding: value,
                            });
                        }
                    }
                }
                onFocus = {
                    (e) => {
                        if (e.target.value === '0') {
                            e.target.select();
                        }
                    }
                }
                placeholder = "Enter funding amount"
                className = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                min = "0"
                max = { selectedProduct.totalBudget }
                /> < /
                div >

                <
                div >
                <
                label className = "block text-sm font-semibold text-gray-700 mb-2" >
                Funding Status <
                /label> <
                select value = { fundingData.fundingStatus }
                onChange = {
                    (e) =>
                    setFundingData({
                        ...fundingData,
                        fundingStatus: e.target.value,
                    })
                }
                className = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" >
                <
                option value = "active" > Active < /option> <
                option value = "paused" > Paused < /option> <
                option value = "completed" > Completed < /option> <
                option value = "cancelled" > Cancelled < /option> < /
                select > <
                /div>

                <
                div className = "bg-gradient-to-br from-blue-50 to-green-50 p-4 rounded-xl" >
                <
                p className = "text-sm font-semibold text-gray-700 mb-3" >
                Progress Preview <
                /p> <
                div className = "flex justify-between text-sm mb-2" >
                <
                span > Progress: < /span> <
                span className = "font-semibold text-blue-600" > {
                    calculateFundingPercentage(
                        fundingData.currentFunding,
                        selectedProduct.totalBudget
                    ).toFixed(1)
                } %
                <
                /span> < /
                div > <
                div className = "w-full bg-white rounded-full h-3 mb-2" >
                <
                div className = "bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style = {
                    {
                        width: `${calculateFundingPercentage(
                                                    fundingData.currentFunding,
                                                    selectedProduct.totalBudget
                                                )}%`,
                    }
                }
                /> < /
                div > <
                div className = "flex justify-between text-xs text-gray-600" >
                <
                span > Raised: { formatCurrency(fundingData.currentFunding) } < /span> <
                span > Goal: { formatCurrency(selectedProduct.totalBudget) } < /span> < /
                div > <
                /div> < /
                div >

                <
                div className = "flex gap-3 mt-8" >
                <
                button onClick = {
                    () => {
                        updateFundingProgress(selectedProduct._id, fundingData);
                        setShowFundingModal(false);
                    }
                }
                className = "flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold" >
                Update Funding <
                /button> <
                button onClick = {
                    () => setShowFundingModal(false)
                }
                className = "flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold" >
                Cancel <
                /button> < /
                div > <
                /div> < /
                div >
            )
        }

        { /* Budget Update Modal */ } {
            showBudgetModal && selectedProduct && ( <
                div className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" >
                <
                div className = "bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" >
                <
                div className = "flex justify-between items-center mb-6" >
                <
                h3 className = "text-2xl font-bold text-gray-900" >
                Edit Total Budget(₹) <
                /h3> <
                button onClick = {
                    () => setShowBudgetModal(false)
                }
                className = "text-gray-400 hover:text-gray-600 text-2xl" > ✕
                <
                /button> < /
                div >

                <
                div className = "mb-6" >
                <
                h4 className = "font-semibold text-lg" > { selectedProduct.productTitle } < /h4> <
                p className = "text-gray-600" > by { selectedProduct.artistName } < /p> < /
                div >

                <
                div className = "space-y-6" >
                <
                div >
                <
                label className = "block text-sm font-semibold text-gray-700 mb-2" >
                Total Budget(₹) <
                /label> <
                input type = "number"
                value = { budgetData.totalBudget === 0 ? '' : budgetData.totalBudget }
                onChange = {
                    (e) =>
                    setBudgetData({
                        ...budgetData,
                        totalBudget: parseFloat(e.target.value) || 0,
                    })
                }
                onFocus = {
                    (e) => {
                        if (e.target.value === '0') {
                            e.target.select();
                        }
                    }
                }
                placeholder = "Enter total budget amount"
                className = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                min = "0"
                step = "1000" /
                >
                <
                p className = "text-xs text-gray-500 mt-1" >
                This is the total funding goal
                for the project <
                /p> < /
                div >

                <
                div className = "bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl" >
                <
                p className = "text-sm font-semibold text-gray-700 mb-3" >
                Budget Impact Preview <
                /p> <
                div className = "space-y-3" >
                <
                div className = "flex justify-between text-sm" >
                <
                span > New Total Budget: < /span> <
                span className = "font-semibold text-purple-600" > { formatCurrency(budgetData.totalBudget || 0) } <
                /span> < /
                div > <
                div className = "flex justify-between text-sm" >
                <
                span > Current Funding: < /span> <
                span className = "font-semibold text-green-600" > { formatCurrency(selectedProduct.currentFunding || 0) } <
                /span> < /
                div > <
                div className = "flex justify-between text-sm" >
                <
                span > New Funding Progress: < /span> <
                span className = "font-semibold text-blue-600" > {
                    budgetData.totalBudget > 0 ?
                    ((selectedProduct.currentFunding || 0) / budgetData.totalBudget * 100).toFixed(1) : 0
                } %
                <
                /span> < /
                div > <
                div className = "w-full bg-white rounded-full h-3 mt-2" >
                <
                div className = "bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style = {
                    {
                        width: `${budgetData.totalBudget > 0 
                                                        ? Math.min((selectedProduct.currentFunding || 0) / budgetData.totalBudget * 100, 100)
                                                        : 0}%`,
                    }
                }
                /> < /
                div > <
                /div> < /
                div > <
                /div>

                <
                div className = "flex gap-3 mt-8" >
                <
                button onClick = {
                    () => {
                        updateTotalBudget(selectedProduct._id, budgetData);
                    }
                }
                className = "flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold" >
                Update Budget <
                /button> <
                button onClick = {
                    () => setShowBudgetModal(false)
                }
                className = "flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold" >
                Cancel <
                /button> < /
                div > <
                /div> < /
                div >
            )
        }

        { /* Status Update Modal */ } {
            showStatusModal && selectedProduct && ( <
                div className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" >
                <
                div className = "bg-white rounded-2xl w-full max-w-md p-6" >
                <
                div className = "flex justify-between items-center mb-6" >
                <
                h3 className = "text-xl font-bold text-gray-900" >
                Update Status <
                /h3> <
                button onClick = {
                    () => setShowStatusModal(false)
                }
                className = "text-gray-400 hover:text-gray-600 text-2xl" > ✕
                <
                /button> < /
                div >

                <
                div className = "space-y-4" >
                <
                div >
                <
                label className = "block text-sm font-medium text-gray-700 mb-2" >
                Product: { selectedProduct.productTitle } <
                /label> <
                label className = "block text-sm font-medium text-gray-700 mb-2" >
                Current Status: < span className = "capitalize" > { selectedProduct.productStatus ? selectedProduct.productStatus.replace("-", " ") : "N/A" } < /span> < /
                label > <
                /div>

                <
                div >
                <
                label className = "block text-sm font-medium text-gray-700 mb-2" >
                New Status <
                /label> <
                select value = { statusData.productStatus }
                onChange = {
                    (e) => setStatusData({ productStatus: e.target.value })
                }
                className = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" >
                <
                option value = "funding" > Funding < /option> <
                option value = "in-production" > In Production < /option> <
                option value = "completed" > Completed < /option> <
                option value = "cancelled" > Cancelled < /option> < /
                select > <
                /div> < /
                div >

                <
                div className = "flex gap-3 mt-8" >
                <
                button onClick = {
                    () => {
                        updateProductStatus(selectedProduct._id, statusData.productStatus);
                    }
                }
                className = "flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold" >
                Update Status <
                /button> <
                button onClick = {
                    () => setShowStatusModal(false)
                }
                className = "flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold" >
                Cancel <
                /button> < /
                div > <
                /div> < /
                div >
            )
        }

        { /* Product Details Modal */ } {
            showDetailsModal && selectedProduct && ( <
                div className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" >
                <
                div className = "bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" >
                <
                div className = "sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl" >
                <
                div className = "flex justify-between items-center" >
                <
                div >
                <
                h3 className = "text-2xl font-bold text-gray-900" > { selectedProduct.productTitle } <
                /h3> <
                p className = "text-gray-600" >
                by { selectedProduct.artistName } <
                /p> < /
                div > <
                button onClick = {
                    () => setShowDetailsModal(false)
                }
                className = "text-gray-400 hover:text-gray-600 text-2xl" > ✕
                <
                /button> < /
                div > <
                /div>

                <
                div className = "p-6 space-y-6" > { /* Top summary with image and key facts */ } <
                div className = "grid grid-cols-1 md:grid-cols-3 gap-6" >
                <
                div className = "md:col-span-1" >
                <
                img src = { selectedProduct.coverImage || "/placeholder.png" }
                alt = { selectedProduct.productTitle }
                className = "w-full h-56 md:h-full object-cover rounded-lg border" /
                >
                <
                /div> <
                div className = "md:col-span-2" >
                <
                div className = "grid grid-cols-1 sm:grid-cols-2 gap-4" >
                <
                div className = "bg-gray-50 rounded-lg p-4 border" >
                <
                div className = "text-xs text-gray-500" > Category < /div> <
                div className = "text-sm font-semibold text-gray-900" > { selectedProduct.category || "-" } <
                /div> < /
                div > <
                div className = "bg-gray-50 rounded-lg p-4 border" >
                <
                div className = "text-xs text-gray-500" > Genre < /div> <
                div className = "text-sm font-semibold text-gray-900" > { selectedProduct.genre || "-" } <
                /div> < /
                div > <
                div className = "bg-gray-50 rounded-lg p-4 border" >
                <
                div className = "text-xs text-gray-500" > Status < /div> <
                div className = "text-sm font-semibold text-gray-900 capitalize" > { selectedProduct.productStatus ? selectedProduct.productStatus.replace("-", " ") : "N/A" } <
                /div> < /
                div > <
                div className = "bg-gray-50 rounded-lg p-4 border" >
                <
                div className = "text-xs text-gray-500" > Visibility < /div> <
                div className = "text-sm font-semibold text-gray-900" > { selectedProduct.isActive ? "Active" : "Inactive" } { selectedProduct.isFeatured ? " • Featured" : "" } <
                /div> < /
                div > <
                /div>

                { /* Funding stats */ } <
                div className = "mt-6 bg-white rounded-lg border p-4" >
                <
                div className = "flex justify-between text-sm mb-2" >
                <
                span className = "text-gray-600" > Funding Progress < /span> <
                span className = "font-semibold text-blue-600" > {
                    Math.min(
                        ((selectedProduct.currentFunding || 0) /
                            (selectedProduct.totalBudget || 1)) * 100,
                        100
                    ).toFixed(1)
                } %
                <
                /span> < /
                div > <
                div className = "w-full bg-gray-200 rounded-full h-2 mb-2" >
                <
                div className = "bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                style = {
                    {
                        width: `${Math.min(
                                                            ((selectedProduct.currentFunding || 0) /
                                                                (selectedProduct.totalBudget || 1)) * 100,
                                                            100
                                                        )}%`,
                    }
                }
                /> < /
                div > <
                div className = "grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs" >
                <
                div >
                <
                div className = "text-gray-500" > Raised < /div> <
                div className = "font-semibold text-gray-900" > { formatCurrency(selectedProduct.currentFunding || 0) } <
                /div> < /
                div > <
                div >
                <
                div className = "text-gray-500" > Goal < /div> <
                div className = "font-semibold text-gray-900" > { formatCurrency(selectedProduct.totalBudget || 0) } <
                /div> < /
                div > <
                div >
                <
                div className = "text-gray-500" > Remaining < /div> <
                div className = "font-semibold text-gray-900" > {
                    formatCurrency(
                        (selectedProduct.totalBudget || 0) -
                        (selectedProduct.currentFunding || 0)
                    )
                } <
                /div> < /
                div > <
                div >
                <
                div className = "text-gray-500" > Investors < /div> <
                div className = "font-semibold text-gray-900" > { selectedProduct.totalInvestors || 0 } <
                /div> < /
                div > <
                /div> < /
                div > <
                /div> < /
                div >

                { /* Description */ } <
                div className = "bg-white rounded-lg border p-4" >
                <
                div className = "text-sm text-gray-500 mb-1" > Description < /div> <
                p className = "text-sm text-gray-800 leading-6 whitespace-pre-wrap" > { selectedProduct.description || "No description provided." } <
                /p> < /
                div >

                { /* Media Links */ } <
                div className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" > {
                    selectedProduct.youtubeLink && ( <
                        a href = { selectedProduct.youtubeLink }
                        target = "_blank"
                        rel = "noopener noreferrer"
                        className = "block border rounded-lg p-3 hover:bg-gray-50" >
                        <
                        div className = "text-xs text-gray-500" > YouTube < /div> <
                        div className = "text-sm font-semibold text-blue-700 truncate" >
                        Open video <
                        /div> < /
                        a >
                    )
                } {
                    selectedProduct.videoFile && ( <
                        a href = { selectedProduct.videoFile }
                        target = "_blank"
                        rel = "noopener noreferrer"
                        className = "block border rounded-lg p-3 hover:bg-gray-50" >
                        <
                        div className = "text-xs text-gray-500" > Video File < /div> <
                        div className = "text-sm font-semibold text-blue-700 truncate" >
                        Download / Play <
                        /div> < /
                        a >
                    )
                } {
                    selectedProduct.demoTrack && ( <
                        a href = { selectedProduct.demoTrack }
                        target = "_blank"
                        rel = "noopener noreferrer"
                        className = "block border rounded-lg p-3 hover:bg-gray-50" >
                        <
                        div className = "text-xs text-gray-500" > Demo Track < /div> <
                        div className = "text-sm font-semibold text-blue-700 truncate" >
                        Listen <
                        /div> < /
                        a >
                    )
                } {
                    selectedProduct.fullTrack && ( <
                        a href = { selectedProduct.fullTrack }
                        target = "_blank"
                        rel = "noopener noreferrer"
                        className = "block border rounded-lg p-3 hover:bg-gray-50" >
                        <
                        div className = "text-xs text-gray-500" > Full Track < /div> <
                        div className = "text-sm font-semibold text-blue-700 truncate" >
                        Listen <
                        /div> < /
                        a >
                    )
                } <
                /div>

                { /* Quick manage buttons */ } <
                div className = "flex flex-wrap gap-3" >
                <
                button onClick = {
                    () => openFundingModal(selectedProduct)
                }
                className = "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold" >
                Manage Funding <
                /button> <
                button onClick = {
                    () =>
                    toggleFeatured(
                        selectedProduct._id,
                        selectedProduct.isFeatured
                    )
                }
                className = "px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-semibold" > { selectedProduct.isFeatured ? "Unfeature" : "Feature" } <
                /button> <
                button onClick = {
                    () =>
                    toggleActive(selectedProduct._id, selectedProduct.isActive)
                }
                className = "px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-semibold" > { selectedProduct.isActive ? "Deactivate" : "Activate" } <
                /button> <
                button onClick = {
                    () => handleDelete(selectedProduct._id)
                }
                className = "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold" >
                Delete <
                /button> < /
                div > <
                /div> < /
                div > <
                /div>
            )
        }

        { /* Pagination */ } {
            totalPages > 1 && ( <
                div className = "flex flex-col items-center mt-8 space-y-4" > { /* Page Info */ } <
                div className = "text-sm text-gray-600" >
                Showing {
                    ((currentPage - 1) * 500) + 1
                }
                to { Math.min(currentPage * 500, totalProducts || products.length) }
                of { totalProducts || products.length }
                products <
                /div>

                { /* Pagination Controls */ } <
                div className = "flex items-center space-x-2" > { /* Previous Button */ } <
                button onClick = {
                    () => handlePageChange(currentPage - 1)
                }
                disabled = { currentPage === 1 }
                className = { `px-4 py-2 rounded-lg font-medium text-sm ${
                                    currentPage === 1
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                                }` } >
                Previous <
                /button>

                { /* Page Numbers */ } {
                    Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 10) {
                            pageNum = i + 1;
                        } else if (currentPage <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 4) {
                            pageNum = totalPages - 9 + i;
                        } else {
                            pageNum = currentPage - 4 + i;
                        }

                        return ( <
                            button key = { pageNum }
                            onClick = {
                                () => handlePageChange(pageNum)
                            }
                            className = { `px-3 py-2 rounded-lg font-medium text-sm ${
                                            currentPage === pageNum
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                                        }` } > { pageNum } <
                            /button>
                        );
                    })
                }

                { /* Next Button */ } <
                button onClick = {
                    () => handlePageChange(currentPage + 1)
                }
                disabled = { currentPage === totalPages }
                className = { `px-4 py-2 rounded-lg font-medium text-sm ${
                                    currentPage === totalPages
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                                }` } >
                Next <
                /button> < /
                div >

                { /* Page indicator */ } <
                div className = "text-xs text-gray-500" >
                Page { currentPage }
                of { totalPages } <
                /div> < /
                div >
            )
        }

        { /* Loading Indicator for Navigation */ } {
            isNavigating && ( <
                div className = "flex justify-center items-center mt-4" >
                <
                div className = "flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg" >
                <
                div className = "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" > < /div> <
                span className = "text-sm font-medium" > Loading page { currentPage }... < /span> < /
                div > <
                /div>
            )
        }

        { /* Loading Overlay */ } {
            loading && products.length > 0 && ( <
                div className = "fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40" >
                <
                div className = "bg-white rounded-lg p-6 shadow-xl" >
                <
                div className = "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" > < /div> <
                p className = "text-sm text-gray-600 mt-2" > Loading... < /p> < /
                div > <
                /div>
            )
        } <
        /div> < /
        div >
    );
};

ListInvestmentProducts.propTypes = {
    token: PropTypes.string.isRequired
};

export default ListInvestmentProducts;