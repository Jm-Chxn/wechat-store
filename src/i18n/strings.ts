// Single source of truth for every visible string in the app. The dictionary
// is intentionally flat so missing keys fail loudly. Add keys here whenever a
// new label is needed in any component or page.

export const dictionary = {
  // brand
  "brand.name": { en: "Good Food, Shared Together", zh: "好食材，一起团" },
  "brand.tagline": {
    en: "Community group-buying, neighbour-friendly prices.",
    zh: "邻里团购，好食材一起拼。",
  },

  // navigation
  "nav.home": { en: "Home", zh: "首页" },
  "nav.shop": { en: "Shop", zh: "商品" },
  "nav.categories": { en: "Categories", zh: "分类" },
  "nav.cart": { en: "Cart", zh: "购物车" },
  "nav.account": { en: "Account", zh: "我的" },
  "nav.signIn": { en: "Sign In", zh: "登录" },
  "nav.signOut": { en: "Sign Out", zh: "退出登录" },
  "nav.admin": { en: "Admin", zh: "管理后台" },
  "nav.openMenu": { en: "Open menu", zh: "打开菜单" },
  "nav.closeMenu": { en: "Close menu", zh: "关闭菜单" },

  // home
  "home.heroTitle": { en: "Good Food, Shared Together", zh: "好食材，一起团" },
  "home.heroSubtitle": {
    en: "Neighbour-friendly prices on the pantry staples your family loves.",
    zh: "和邻居一起拼，让家里常备的好味道更划算。",
  },
  "home.browseProducts": { en: "Browse Products", zh: "浏览商品" },
  "home.howItWorks": { en: "How It Works", zh: "团购流程" },
  "home.popularThisWeek": { en: "Popular This Week", zh: "本周热门" },
  "home.browseByCategory": { en: "Browse by Category", zh: "分类选购" },
  "home.newArrivals": { en: "New Arrivals", zh: "新品上架" },
  "home.communityNoticeTitle": { en: "Community Notice", zh: "社区公告" },
  "home.communityNoticeBody": {
    en: "New batch arriving Thursday — pickup at the Maple Street community fridge from 4–7 PM.",
    zh: "周四新一批到货——枫树街社区冷柜下午4点至7点自取。",
  },
  "home.trustFresh": { en: "Daily fresh", zh: "每日新鲜" },
  "home.trustFreshBlurb": { en: "Sourced from local farms each morning.", zh: "每日清晨直采本地小农场。" },
  "home.trustGroup": { en: "Group prices", zh: "团购价" },
  "home.trustGroupBlurb": { en: "10–30% off when neighbours buy together.", zh: "邻里拼团节省 10–30%。" },
  "home.trustPickup": { en: "Easy pickup", zh: "便捷自取" },
  "home.trustPickupBlurb": { en: "Walk to your community fridge — zero shipping.", zh: "走到社区冷柜，零运费。" },
  "home.viewAll": { en: "View all", zh: "查看全部" },

  // products / shop
  "shop.title": { en: "Shop", zh: "全部商品" },
  "shop.filter": { en: "Filter", zh: "筛选" },
  "shop.sort": { en: "Sort", zh: "排序" },
  "shop.sortNewest": { en: "Newest", zh: "最新上架" },
  "shop.sortPriceAsc": { en: "Price: Low to High", zh: "价格由低到高" },
  "shop.sortPriceDesc": { en: "Price: High to Low", zh: "价格由高到低" },
  "shop.priceRange": { en: "Price range", zh: "价格区间" },
  "shop.dietary": { en: "Dietary", zh: "饮食偏好" },
  "shop.allCategories": { en: "All categories", zh: "全部分类" },
  "shop.empty": { en: "No products match your filters.", zh: "没有符合筛选的商品。" },
  "shop.resultsCount": { en: "{n} products", zh: "{n} 件商品" },
  "shop.breadcrumbHome": { en: "Home", zh: "首页" },
  "shop.breadcrumbShop": { en: "Shop", zh: "全部商品" },
  "shop.clearFilters": { en: "Clear filters", zh: "清空筛选" },

  // product / card
  "product.addToCart": { en: "Add to Cart", zh: "加入购物车" },
  "product.buyNow": { en: "Buy Now", zh: "立即购买" },
  "product.outOfStock": { en: "Out of Stock", zh: "暂无库存" },
  "product.limitedStock": { en: "Limited Stock", zh: "库存有限" },
  "product.inStock": { en: "In Stock", zh: "现货充足" },
  "product.new": { en: "New", zh: "新品" },
  "product.qty": { en: "Quantity", zh: "数量" },
  "product.youMightAlsoLike": { en: "You Might Also Like", zh: "你可能还喜欢" },
  "product.ingredients": { en: "Ingredients", zh: "成分" },
  "product.nutrition": { en: "Nutrition", zh: "营养信息" },
  "product.storage": { en: "Storage", zh: "储存" },
  "product.origin": { en: "Origin", zh: "产地" },
  "product.ingredientsBody": { en: "All natural — no artificial preservatives.", zh: "天然食材，不含人工防腐剂。" },
  "product.nutritionBody": { en: "Nutrition information varies by item — see packaging.", zh: "具体营养信息以包装为准。" },
  "product.storageBody": { en: "Refrigerate after opening; consume within 3 days.", zh: "开封后冷藏，请于 3 天内食用。" },
  "product.originBody": { en: "Sourced via partner farms in Greater Toronto.", zh: "由多伦多地区合作农场直供。" },
  "product.added": { en: "Added to cart", zh: "已加入购物车" },
  "product.packSize": { en: "Pack size", zh: "规格" },
  "product.savedForLater": { en: "Save for later", zh: "稍后再买" },

  // dietary tags
  "tag.VEGAN": { en: "Vegan", zh: "纯素" },
  "tag.VEGETARIAN": { en: "Vegetarian", zh: "素食" },
  "tag.GLUTEN_FREE": { en: "Gluten-Free", zh: "无麸质" },
  "tag.HALAL": { en: "Halal", zh: "清真" },
  "tag.ORGANIC": { en: "Organic", zh: "有机" },
  "tag.SPICY": { en: "Spicy", zh: "辣味" },

  // categories
  "category.fresh-meat-poultry": { en: "Fresh Meat & Poultry", zh: "新鲜肉类禽类" },
  "category.eggs-dairy": { en: "Eggs & Dairy", zh: "蛋类乳品" },
  "category.snacks-crackers": { en: "Snacks & Crackers", zh: "零食饼干" },
  "category.noodles-wrappers": { en: "Noodles & Wrappers", zh: "面条面皮" },
  "category.pantry-sauces": { en: "Pantry & Sauces", zh: "调料厨房" },
  "category.frozen-foods": { en: "Frozen Foods", zh: "冷冻食品" },
  "category.tofu-soy": { en: "Tofu & Soy Products", zh: "豆腐豆制品" },
  "category.beverages": { en: "Beverages", zh: "饮品" },

  // cart
  "cart.title": { en: "Your Cart", zh: "购物车" },
  "cart.empty": { en: "Your cart is empty.", zh: "购物车空空如也。" },
  "cart.emptyCta": { en: "Browse Products", zh: "去看看好物" },
  "cart.subtotal": { en: "Subtotal", zh: "小计" },
  "cart.deliveryFee": { en: "Community delivery", zh: "社区配送" },
  "cart.total": { en: "Total", zh: "合计" },
  "cart.proceed": { en: "Proceed to Checkout", zh: "去结算" },
  "cart.continueShopping": { en: "Continue Shopping", zh: "继续购物" },
  "cart.promo": { en: "Promo code", zh: "优惠码" },
  "cart.applyPromo": { en: "Apply", zh: "应用" },
  "cart.remove": { en: "Remove", zh: "移除" },
  "cart.lineQty": { en: "Qty", zh: "数量" },
  "cart.itemCount": { en: "{n} items", zh: "{n} 件商品" },

  // checkout
  "checkout.title": { en: "Checkout", zh: "结账" },
  "checkout.contact": { en: "Contact", zh: "联系方式" },
  "checkout.contactName": { en: "Name", zh: "姓名" },
  "checkout.contactPhone": { en: "Phone", zh: "手机号" },
  "checkout.pickupCommunity": { en: "Pickup community", zh: "自取小区" },
  "checkout.payment": { en: "Payment", zh: "支付方式" },
  "checkout.cardNumber": { en: "Card number", zh: "卡号" },
  "checkout.cardExpiry": { en: "Expiry (MM/YY)", zh: "有效期 (月/年)" },
  "checkout.cardCvc": { en: "CVC", zh: "安全码" },
  "checkout.cardName": { en: "Name on card", zh: "持卡人姓名" },
  "checkout.placeOrder": { en: "Place Order", zh: "提交订单" },
  "checkout.orderSummary": { en: "Order summary", zh: "订单摘要" },
  "checkout.signInRequired": {
    en: "Sign in to place your order.",
    zh: "请登录后提交订单。",
  },
  "checkout.signInWithWechat": { en: "Sign in", zh: "登录" },
  "checkout.cardHint": {
    en: "Demo only — no real card is charged.",
    zh: "仅做演示，不会实际扣款。",
  },
  "checkout.communityMaple": { en: "Maple Street", zh: "枫树街" },
  "checkout.communityCedar": { en: "Cedar Lane", zh: "雪松巷" },
  "checkout.communityRiver": { en: "Riverside Court", zh: "河滨苑" },
  "checkout.requiredNote": {
    en: "Fields marked with * are required",
    zh: "标有 * 的字段为必填项",
  },
  "checkout.deliveryNote": {
    en: "Orders over $150 will be delivered to your home.",
    zh: "订单满 $150 将送货上门。",
  },
  "checkout.deliveryAddress": { en: "Delivery address", zh: "送货地址" },
  "checkout.addressLine1": { en: "Street address", zh: "街道地址" },
  "checkout.addressLine2": {
    en: "Apartment / building # (optional)",
    zh: "公寓 / 楼号（选填）",
  },
  "checkout.city": { en: "City", zh: "城市" },
  "checkout.postalCode": { en: "Postal code", zh: "邮编" },
  "checkout.selectCity": { en: "Select a city", zh: "选择城市" },
  "checkout.backToCart": { en: "Back to cart", zh: "返回购物车" },

  // order confirmed
  "order.confirmed": { en: "Order Confirmed", zh: "订单已确认" },
  "order.thankYou": { en: "Thanks for joining the group buy!", zh: "感谢参与本次团购！" },
  "order.id": { en: "Order #", zh: "订单号" },
  "order.viewOrder": { en: "View Order", zh: "查看订单" },
  "order.continueShopping": { en: "Continue Shopping", zh: "继续购物" },
  "order.summary": { en: "Order summary", zh: "订单详情" },
  "order.status.CONFIRMED": { en: "Confirmed", zh: "已确认" },
  "order.status.PROCESSING": { en: "Processing", zh: "处理中" },
  "order.status.COMPLETED": { en: "Completed", zh: "已完成" },
  "order.status.CANCELLED": { en: "Cancelled", zh: "已取消" },
  "order.placedAt": { en: "Placed", zh: "下单时间" },
  "order.pickupAt": { en: "Pickup at", zh: "自取地点" },
  "order.signInToView": { en: "Sign in to see your past orders.", zh: "登录后查看历史订单。" },

  // account
  "account.title": { en: "My Account", zh: "我的账户" },
  "account.welcome": { en: "Welcome back, {name}", zh: "欢迎回来，{name}" },
  "account.myOrders": { en: "My Orders", zh: "我的订单" },
  "account.savedItems": { en: "Saved Items", zh: "收藏的商品" },
  "account.signOut": { en: "Sign Out", zh: "退出登录" },
  "account.openid": { en: "User ID", zh: "用户编号" },
  "account.joined": { en: "Joined", zh: "加入时间" },
  "account.role": { en: "Role", zh: "身份" },
  "account.role.user": { en: "Member", zh: "会员" },
  "account.role.admin": { en: "Admin", zh: "管理员" },
  "account.adminPanel": { en: "Admin Panel", zh: "管理后台" },
  "account.noOrders": { en: "You haven't placed any orders yet.", zh: "你还没有订单记录。" },
  "account.startShopping": { en: "Start shopping", zh: "去逛逛" },

  // login
  "login.title": { en: "Sign In", zh: "登录" },
  "login.signInTab": { en: "Sign In", zh: "登录" },
  "login.createTab": { en: "Create Account", zh: "创建账户" },
  "login.email": { en: "Email", zh: "邮箱" },
  "login.password": { en: "Password", zh: "密码" },
  "login.continueWithGoogle": { en: "Continue with Google", zh: "使用 Google 登录" },
  "login.signInWithWeChat": { en: "Sign in with WeChat", zh: "微信登录" },
  "login.continueAsGuest": { en: "Continue as Guest", zh: "以访客身份继续" },
  "login.createAccount": { en: "Create Account", zh: "创建账户" },
  "login.or": { en: "or", zh: "或" },
  "login.dividerHint": { en: "Sign in with your email or continue with Google.", zh: "用邮箱登录，或通过 Google 继续。" },
  "login.passwordTooShort": { en: "Password must be at least 6 characters", zh: "密码至少需要 6 位" },
  "login.signInError": { en: "Sign-in failed. Please check your credentials.", zh: "登录失败，请检查邮箱和密码。" },
  "login.signUpError": { en: "Could not create account. Please try again.", zh: "账户创建失败，请重试。" },
  "login.checkEmail": { en: "Check your inbox to confirm your email.", zh: "请到邮箱查收确认邮件。" },

  // wechat consent
  "wechat.consentTitle": { en: "WeChat Authorization", zh: "微信授权登录" },
  "wechat.scanHint": { en: "Scan with WeChat to sign in", zh: "请使用微信扫码登录" },
  "wechat.devHint": { en: "Demo mode — pick an identity below", zh: "演示模式——请选择以下身份" },
  "wechat.authorize": { en: "Authorize", zh: "确认授权" },
  "wechat.cancel": { en: "Cancel", zh: "取消" },
  "wechat.appName": { en: "Good Food Tuangou", zh: "好食材团购" },
  "wechat.appAsks": {
    en: "is requesting access to your WeChat profile.",
    zh: "正在请求获取你的微信资料。",
  },
  "wechat.permissions": {
    en: "• Public info (nickname, avatar)\n• Read your openid",
    zh: "• 获取公开资料（昵称、头像）\n• 获取 openid",
  },
  "wechat.adminBadge": { en: "Admin", zh: "管理员" },

  // admin
  "admin.title": { en: "Admin Dashboard", zh: "后台总览" },
  "admin.products": { en: "Products", zh: "商品" },
  "admin.users": { en: "Users", zh: "用户" },
  "admin.orders": { en: "Orders", zh: "订单" },
  "admin.activity": { en: "Activity", zh: "动态" },
  "admin.statTotalUsers": { en: "Total Users", zh: "用户总数" },
  "admin.statTodayOrders": { en: "Today's Orders", zh: "今日订单" },
  "admin.statTodayRevenue": { en: "Today's Revenue", zh: "今日营收" },
  "admin.statTopCategory": { en: "Top Category", zh: "热门分类" },
  "admin.recentOrders": { en: "Recent Orders", zh: "最新订单" },
  "admin.revenueByCategory": { en: "Revenue by Category", zh: "分类营收" },
  "admin.uploadNew": { en: "Upload New Item", zh: "上架新商品" },
  "admin.delete": { en: "Delete", zh: "删除" },
  "admin.edit": { en: "Edit", zh: "编辑" },
  "admin.confirmDelete": { en: "Delete this product?", zh: "确认删除此商品？" },
  "admin.confirmDeleteBody": { en: "This will remove it from the storefront.", zh: "删除后店铺将不再显示。" },
  "admin.cancel": { en: "Cancel", zh: "取消" },
  "admin.save": { en: "Save", zh: "保存" },
  "admin.productImageUrl": { en: "Image URL", zh: "图片链接" },
  "admin.productNameEn": { en: "Name (English)", zh: "名称（英文）" },
  "admin.productNameZh": { en: "Name (中文)", zh: "名称（中文）" },
  "admin.productDescEn": { en: "Description (English)", zh: "描述（英文）" },
  "admin.productDescZh": { en: "Description (中文)", zh: "描述（中文）" },
  "admin.productPrice": { en: "Price (USD)", zh: "价格（美元）" },
  "admin.productPackEn": { en: "Pack size (English)", zh: "规格（英文）" },
  "admin.productPackZh": { en: "Pack size (中文)", zh: "规格（中文）" },
  "admin.productCategory": { en: "Category", zh: "分类" },
  "admin.productStockStatus": { en: "Stock status", zh: "库存状态" },
  "admin.productStockCount": { en: "Stock count", zh: "库存数量" },
  "admin.productIsNew": { en: "Mark as new", zh: "标记为新品" },
  "admin.productDietary": { en: "Dietary tags", zh: "饮食标签" },
  "admin.usersTitle": { en: "WeChat Users", zh: "微信用户" },
  "admin.usersBlurb": { en: "Everyone who has interacted with the shop.", zh: "所有产生过互动的用户。" },
  "admin.usersTotalOrders": { en: "Orders", zh: "订单数" },
  "admin.usersTotalSpent": { en: "Total spent", zh: "消费总额" },
  "admin.usersLastActivity": { en: "Last seen", zh: "最近活跃" },
  "admin.userDrawerActivity": { en: "Activity", zh: "操作记录" },
  "admin.userDrawerOrders": { en: "Orders", zh: "订单" },
  "admin.ordersTitle": { en: "Orders", zh: "订单" },
  "admin.ordersFilterAll": { en: "All", zh: "全部" },
  "admin.ordersStatus": { en: "Status", zh: "状态" },
  "admin.activityFeed": { en: "Activity feed", zh: "动态时间线" },
  "admin.activityFilterAll": { en: "All events", zh: "全部事件" },
  "admin.gateLoading": { en: "Checking your access…", zh: "正在校验权限…" },
  "admin.notAdmin": { en: "Admin access required.", zh: "需要管理员权限。" },
  "admin.empty": { en: "Nothing here yet.", zh: "暂无数据。" },

  // activity verbs
  "activity.SIGN_IN": { en: "signed in", zh: "登录了账户" },
  "activity.SIGN_OUT": { en: "signed out", zh: "退出了账户" },
  "activity.CLICK_BUY": { en: "clicked Buy on", zh: "点击了购买" },
  "activity.ADD_TO_CART": { en: "added to cart", zh: "添加到购物车" },
  "activity.PLACE_ORDER": { en: "placed an order", zh: "提交了订单" },
  "activity.ADMIN_PRODUCT_CREATE": { en: "uploaded a new product", zh: "上架了新商品" },
  "activity.ADMIN_PRODUCT_DELETE": { en: "deleted a product", zh: "删除了商品" },
  "activity.ADMIN_PRODUCT_UPDATE": { en: "updated a product", zh: "更新了商品" },
  "activity.ADMIN_ORDER_STATUS": { en: "updated an order status", zh: "更新了订单状态" },

  // common
  "common.loading": { en: "Loading…", zh: "加载中…" },
  "common.guest": { en: "Guest", zh: "访客" },
  "common.seeMore": { en: "See more", zh: "查看更多" },
  "common.search": { en: "Search products", zh: "搜索商品" },
  "common.required": { en: "Required", zh: "必填" },
  "common.invalidEmail": { en: "Enter a valid email", zh: "请输入有效邮箱" },
  "common.minLen": { en: "Too short", zh: "字符太短" },
  "common.copy": { en: "Copy", zh: "复制" },
  "common.copied": { en: "Copied!", zh: "已复制！" },
  "common.langToggle": { en: "EN", zh: "中文" },
  "common.next": { en: "Next", zh: "下一步" },
  "common.back": { en: "Back", zh: "返回" },
  "common.optional": { en: "Optional", zh: "可选" },

  // footer
  "footer.about": { en: "About", zh: "关于我们" },
  "footer.aboutBody": {
    en: "A neighbour-run group-buying co-op. Better food, better prices.",
    zh: "由邻里运营的团购合作社，好食材好价格。",
  },
  "footer.help": { en: "Help", zh: "帮助" },
  "footer.contact": { en: "Contact", zh: "联系我们" },
  "footer.faq": { en: "FAQ", zh: "常见问题" },
  "footer.terms": { en: "Terms", zh: "服务条款" },
  "footer.privacy": { en: "Privacy", zh: "隐私政策" },
  "footer.copyright": {
    en: "© 2026 Good Food Tuangou Co-op. Demo build.",
    zh: "© 2026 好食材团购合作社。演示版本。",
  },
} as const;

export type DictionaryKey = keyof typeof dictionary;

export function lookup(key: DictionaryKey, locale: "en" | "zh"): string {
  const entry = dictionary[key];
  if (!entry) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] missing key: ${key}`);
    }
    return key;
  }
  return entry[locale];
}

/** Substitute {placeholders} with named values. */
export function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
