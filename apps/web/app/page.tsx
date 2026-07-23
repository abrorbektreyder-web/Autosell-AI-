"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  Download,
  Gauge,
  Instagram,
  KeyRound,
  Languages,
  MessageCircle,
  Moon,
  Package,
  PlugZap,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Trash2,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import {
  api,
  Campaign as APICampaign,
  DashboardSummary,
  Lead as APILead,
  Product as APIProduct,
  TelegramSettings,
} from "../lib/api";

type Role = "owner" | "admin";
type Theme = "dark" | "light";
type Lang = "en" | "uz" | "ru";
type OwnerView = "Command" | "Leads" | "Conversations" | "Products" | "Campaigns" | "Integrations" | "AI Rules";
type AdminView = "Platform" | "Businesses" | "System Health" | "Audit";
type View = OwnerView | AdminView;

type Business = {
  name: string;
  owner: string;
  plan: string;
  leads: number;
  health: string;
  status: string;
};

const ownerNav = [
  { label: "Command", icon: Gauge },
  { label: "Leads", icon: UsersRound },
  { label: "Conversations", icon: MessageCircle },
  { label: "Products", icon: Package },
  { label: "Campaigns", icon: Target },
  { label: "Integrations", icon: PlugZap },
  { label: "AI Rules", icon: Sparkles },
] as const;

const adminNav = [
  { label: "Platform", icon: Gauge },
  { label: "Businesses", icon: Building2 },
  { label: "System Health", icon: Activity },
  { label: "Audit", icon: ShieldCheck },
] as const;

const copy = {
  en: {
    langName: "English",
    brandSubtitle: "AI CRM control",
    owner: "Owner",
    admin: "Super Admin",
    securityTitle: "Security posture",
    securityText: "Webhook signature, encrypted tokens, tenant isolation and audit trails are tracked per workspace.",
    ownerWorkspace: "Owner workspace",
    platformCommand: "Platform command",
    ownerHeadline: "Instagram sales operations, orchestrated in one dashboard",
    adminHeadline: "Super admin observability for every tenant",
    search: "Search leads, tenants, keywords...",
    download: "Download report",
    runFlow: "Run test flow",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    language: "Language",
    nav: {
      Command: "Command",
      Leads: "Leads",
      Conversations: "Conversations",
      Products: "Products",
      Campaigns: "Campaigns",
      Integrations: "Integrations",
      "AI Rules": "AI Rules",
      Platform: "Platform",
      Businesses: "Businesses",
      "System Health": "System Health",
      Audit: "Audit",
    },
    heroBadge: "Live comment-to-DM engine",
    heroTitle: "Every keyword becomes a mapped campaign, conversation and qualified lead.",
    heroText: "AI only answers from product data, captures name and phone, then pushes the lead to CRM and Telegram.",
    workflow: ["Comment", "Match", "Private Reply", "AI Sales", "CRM", "Telegram"],
    workflowValues: ["55", "Campaign + product", "First DM", "Name + phone", "Lead saved", "Team notified"],
    liveLead: "Live lead",
    mobileCampaign: "Soft furniture campaign",
    reply: "Reply",
    value: "Value",
    metrics: {
      todayLeads: "Today leads",
      aiConversations: "AI conversations",
      replySuccess: "Reply success",
      activeCampaigns: "Active campaigns",
      businesses: "Businesses",
      totalLeads: "Total leads",
      webhookUptime: "Webhook uptime",
      securityAlerts: "Security alerts",
      healthy: "Healthy",
      stable: "Stable",
      review: "Review",
      total: "total",
      thisMonth: "this month",
    },
    panels: {
      crmLeads: "CRM Leads",
      latestCustomers: "Latest qualified customers",
      openLeads: "Open leads",
      campaigns: "Campaigns",
      keywordRoutes: "Keyword routes",
      manage: "Manage",
      conversation: "Conversation",
      transcript: "AI sales transcript",
      review: "Review",
      guardrails: "AI Guardrails",
      productOnly: "Product-data only",
      tune: "Tune",
      inbox: "Inbox",
      activeConversations: "Active conversations",
      filter: "Filter",
      promptPolicy: "Prompt policy",
      behavior: "Sales assistant behavior",
      save: "Save",
      tenants: "Tenants",
      businessAccounts: "Business accounts",
      openAll: "Open all",
      system: "System",
      runtimeHealth: "Runtime health",
      inspect: "Inspect",
      audit: "Audit",
      securityEvents: "Recent security events",
      viewLog: "View log",
      tenantFlow: "Tenant flow",
      executionLayer: "Platform execution layer",
      trace: "Trace",
    },
    table: {
      customer: "Customer",
      phone: "Phone",
      product: "Product",
      keyword: "Keyword",
      status: "Status",
      value: "Value",
      business: "Business",
      owner: "Owner",
      plan: "Plan",
      leads: "Leads",
      health: "Health",
      tenantWorkspace: "Tenant workspace",
    },
    statuses: { new: "New", contacted: "Contacted", qualified: "Qualified", active: "Active", paused: "Paused", live: "Live", watch: "Watch" },
    productText: "AI responses use only this product card: price, variant, delivery and FAQ.",
    rules: ["Does not guess products", "Does not ask for email or address", "Extracts name and phone", "Creates summary for Telegram"],
    configure: "Configure",
    prompt: "Writes in a short, clear, professional sales tone. Price, delivery, variants and FAQ are answered only from dashboard product data.",
    adminHeroBadge: "Platform pulse",
    adminHeroTitle: "Multi-tenant CRM health, revenue signals and integration risk in one command view.",
    adminHeroText: "Super admin sees businesses, plan status, webhook health, delivery quality and security events without entering tenant dashboards.",
    platform: "Platform",
    healthScore: "health score",
    healthItems: ["API latency 124ms", "Redis dedupe active", "Postgres healthy", "Telegram queue normal"],
    auditItems: ["Token rotated for Mebel House", "Webhook verify token checked", "Admin viewed tenant health"],
  },
  uz: {
    langName: "O'zbek",
    brandSubtitle: "AI CRM boshqaruv",
    owner: "Owner",
    admin: "Super Admin",
    securityTitle: "Xavfsizlik holati",
    securityText: "Webhook signature, shifrlangan tokenlar, tenant isolation va audit izlari har workspace bo'yicha kuzatiladi.",
    ownerWorkspace: "Owner workspace",
    platformCommand: "Platforma boshqaruvi",
    ownerHeadline: "Instagram savdo jarayonlari bitta dashboardda boshqariladi",
    adminHeadline: "Har bir tenant uchun super admin kuzatuvi",
    search: "Lead, tenant, keyword qidirish...",
    download: "Hisobotni yuklab olish",
    runFlow: "Test flow ishga tushirish",
    theme: "Rejim",
    dark: "Dark",
    light: "Light",
    language: "Til",
    nav: {
      Command: "Boshqaruv",
      Leads: "Leadlar",
      Conversations: "Suhbatlar",
      Products: "Mahsulotlar",
      Campaigns: "Kampaniyalar",
      Integrations: "Integratsiyalar",
      "AI Rules": "AI qoidalar",
      Platform: "Platforma",
      Businesses: "Bizneslar",
      "System Health": "Tizim holati",
      Audit: "Audit",
    },
    heroBadge: "Live comment-to-DM engine",
    heroTitle: "Har bir keyword kampaniya, suhbat va qualified leadga ulanadi.",
    heroText: "AI faqat product data asosida javob beradi, ism va telefonni oladi, keyin leadni CRM va Telegramga yuboradi.",
    workflow: ["Comment", "Match", "Private Reply", "AI Sales", "CRM", "Telegram"],
    workflowValues: ["55", "Kampaniya + mahsulot", "Birinchi DM", "Ism + telefon", "Lead saqlandi", "Jamoaga xabar"],
    liveLead: "Live lead",
    mobileCampaign: "Yumshoq mebel kampaniyasi",
    reply: "Javob",
    value: "Qiymat",
    metrics: {
      todayLeads: "Bugungi leadlar",
      aiConversations: "AI suhbatlar",
      replySuccess: "Reply success",
      activeCampaigns: "Active kampaniyalar",
      businesses: "Bizneslar",
      totalLeads: "Jami leadlar",
      webhookUptime: "Webhook uptime",
      securityAlerts: "Security alerts",
      healthy: "Sog'lom",
      stable: "Barqaror",
      review: "Ko'rib chiqish",
      total: "jami",
      thisMonth: "shu oy",
    },
    panels: {
      crmLeads: "CRM Leadlar",
      latestCustomers: "Oxirgi qualified mijozlar",
      openLeads: "Leadlarni ochish",
      campaigns: "Kampaniyalar",
      keywordRoutes: "Keyword yo'nalishlari",
      manage: "Boshqarish",
      conversation: "Suhbat",
      transcript: "AI savdo transkripti",
      review: "Ko'rish",
      guardrails: "AI Guardrails",
      productOnly: "Faqat product data",
      tune: "Sozlash",
      inbox: "Inbox",
      activeConversations: "Active suhbatlar",
      filter: "Filter",
      promptPolicy: "Prompt policy",
      behavior: "Sales assistant xatti-harakati",
      save: "Saqlash",
      tenants: "Tenantlar",
      businessAccounts: "Biznes accountlar",
      openAll: "Hammasini ochish",
      system: "Tizim",
      runtimeHealth: "Runtime holati",
      inspect: "Tekshirish",
      audit: "Audit",
      securityEvents: "Oxirgi security eventlar",
      viewLog: "Logni ko'rish",
      tenantFlow: "Tenant flow",
      executionLayer: "Platforma execution layer",
      trace: "Trace",
    },
    table: {
      customer: "Mijoz",
      phone: "Telefon",
      product: "Mahsulot",
      keyword: "Keyword",
      status: "Status",
      value: "Qiymat",
      business: "Biznes",
      owner: "Owner",
      plan: "Plan",
      leads: "Leadlar",
      health: "Health",
      tenantWorkspace: "Tenant workspace",
    },
    statuses: { new: "Yangi", contacted: "Bog'lanildi", qualified: "Qualified", active: "Active", paused: "Paused", live: "Live", watch: "Watch" },
    productText: "AI javoblari faqat shu product carddagi narx, variant, delivery va FAQ asosida ishlaydi.",
    rules: ["Mahsulotni taxmin qilmaydi", "Email va manzil so'ramaydi", "Ism va telefonni ajratadi", "Telegram uchun summary beradi"],
    configure: "Sozlash",
    prompt: "Qisqa, aniq, professional sotuvchi ohangida yozadi. Narx, delivery, variant va FAQ bo'yicha faqat dashboard product data asosida javob beradi.",
    adminHeroBadge: "Platforma pulsi",
    adminHeroTitle: "Multi-tenant CRM health, revenue signal va integration risk bitta command viewda.",
    adminHeroText: "Super admin tenant dashboardiga kirmasdan bizneslar, plan status, webhook health, delivery quality va security eventlarni ko'radi.",
    platform: "Platforma",
    healthScore: "health score",
    healthItems: ["API latency 124ms", "Redis dedupe active", "Postgres sog'lom", "Telegram queue normal"],
    auditItems: ["Mebel House tokeni rotatsiya qilindi", "Webhook verify token tekshirildi", "Admin tenant health ko'rdi"],
  },
  ru: {
    langName: "Русский",
    brandSubtitle: "AI CRM управление",
    owner: "Владелец",
    admin: "Супер админ",
    securityTitle: "Состояние безопасности",
    securityText: "Webhook signature, зашифрованные токены, изоляция tenant и audit trail отслеживаются по каждому workspace.",
    ownerWorkspace: "Рабочая область владельца",
    platformCommand: "Управление платформой",
    ownerHeadline: "Instagram продажи управляются в одном dashboard",
    adminHeadline: "Super admin наблюдение по каждому tenant",
    search: "Поиск лидов, tenant, keyword...",
    download: "Скачать отчет",
    runFlow: "Запустить test flow",
    theme: "Тема",
    dark: "Темная",
    light: "Светлая",
    language: "Язык",
    nav: {
      Command: "Командный центр",
      Leads: "Лиды",
      Conversations: "Диалоги",
      Products: "Продукты",
      Campaigns: "Кампании",
      Integrations: "Интеграции",
      "AI Rules": "AI правила",
      Platform: "Платформа",
      Businesses: "Бизнесы",
      "System Health": "Состояние системы",
      Audit: "Аудит",
    },
    heroBadge: "Live comment-to-DM engine",
    heroTitle: "Каждый keyword превращается в кампанию, диалог и qualified lead.",
    heroText: "AI отвечает только из product data, собирает имя и телефон, затем отправляет лид в CRM и Telegram.",
    workflow: ["Комментарий", "Match", "Private Reply", "AI продажи", "CRM", "Telegram"],
    workflowValues: ["55", "Кампания + продукт", "Первый DM", "Имя + телефон", "Лид сохранен", "Команда уведомлена"],
    liveLead: "Live лид",
    mobileCampaign: "Кампания мягкой мебели",
    reply: "Ответ",
    value: "Сумма",
    metrics: {
      todayLeads: "Лиды сегодня",
      aiConversations: "AI диалоги",
      replySuccess: "Reply success",
      activeCampaigns: "Активные кампании",
      businesses: "Бизнесы",
      totalLeads: "Всего лидов",
      webhookUptime: "Webhook uptime",
      securityAlerts: "Security alerts",
      healthy: "Здорово",
      stable: "Стабильно",
      review: "Проверить",
      total: "всего",
      thisMonth: "в этом месяце",
    },
    panels: {
      crmLeads: "CRM лиды",
      latestCustomers: "Последние qualified клиенты",
      openLeads: "Открыть лиды",
      campaigns: "Кампании",
      keywordRoutes: "Keyword маршруты",
      manage: "Управлять",
      conversation: "Диалог",
      transcript: "AI sales transcript",
      review: "Обзор",
      guardrails: "AI ограничения",
      productOnly: "Только product data",
      tune: "Настроить",
      inbox: "Inbox",
      activeConversations: "Активные диалоги",
      filter: "Фильтр",
      promptPolicy: "Prompt policy",
      behavior: "Поведение sales assistant",
      save: "Сохранить",
      tenants: "Tenant",
      businessAccounts: "Бизнес аккаунты",
      openAll: "Открыть все",
      system: "Система",
      runtimeHealth: "Runtime состояние",
      inspect: "Проверить",
      audit: "Аудит",
      securityEvents: "Последние security events",
      viewLog: "Открыть лог",
      tenantFlow: "Tenant flow",
      executionLayer: "Execution layer платформы",
      trace: "Trace",
    },
    table: {
      customer: "Клиент",
      phone: "Телефон",
      product: "Продукт",
      keyword: "Keyword",
      status: "Статус",
      value: "Сумма",
      business: "Бизнес",
      owner: "Владелец",
      plan: "План",
      leads: "Лиды",
      health: "Health",
      tenantWorkspace: "Tenant workspace",
    },
    statuses: { new: "Новый", contacted: "Связались", qualified: "Qualified", active: "Активна", paused: "Пауза", live: "Live", watch: "Watch" },
    productText: "AI ответы используют только эту product card: цена, вариант, доставка и FAQ.",
    rules: ["Не угадывает продукт", "Не спрашивает email и адрес", "Извлекает имя и телефон", "Создает summary для Telegram"],
    configure: "Настроить",
    prompt: "Пишет кратко, ясно, в профессиональном sales tone. Цена, доставка, варианты и FAQ отвечаются только из dashboard product data.",
    adminHeroBadge: "Пульс платформы",
    adminHeroTitle: "Multi-tenant CRM health, revenue signals и integration risk в одном command view.",
    adminHeroText: "Super admin видит businesses, plan status, webhook health, delivery quality и security events без входа в tenant dashboard.",
    platform: "Платформа",
    healthScore: "health score",
    healthItems: ["API latency 124ms", "Redis dedupe active", "Postgres healthy", "Telegram queue normal"],
    auditItems: ["Token rotated для Mebel House", "Webhook verify token проверен", "Admin посмотрел tenant health"],
  },
} satisfies Record<Lang, Record<string, unknown>>;

const languageOptions: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "uz", label: "O'zbek" },
  { value: "ru", label: "Русский" },
];

function getBusinesses(lang: Lang): Business[] {
  const c = copy[lang];
  return [
    { name: "Mebel House", owner: "owner@mebel.uz", plan: "Pro", leads: 384, health: "98%", status: c.statuses.live },
    { name: "Office Line", owner: "admin@office.uz", plan: "Starter", leads: 91, health: "91%", status: c.statuses.live },
    { name: "Kitchen Studio", owner: "sales@kitchen.uz", plan: "Pro", leads: 144, health: "84%", status: c.statuses.watch },
    { name: "Demo Tenant", owner: "demo@example.com", plan: "Trial", leads: 12, health: "62%", status: c.statuses.paused },
  ];
}

export default function Home() {
  const [role, setRole] = useState<Role>("owner");
  const [view, setView] = useState<View>("Command");
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<Lang>("uz");
  const [theme, setTheme] = useState<Theme>("dark");
  const [refreshKey, setRefreshKey] = useState(0);

  // Real backend data states
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [campaigns, setCampaigns] = useState<APICampaign[]>([]);
  const [leads, setLeads] = useState<APILead[]>([]);
  const [telegram, setTelegram] = useState<TelegramSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [showTestFlowModal, setShowTestFlowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<APIProduct | null>(null);

  const c = copy[lang];
  const activeNav = role === "owner" ? ownerNav : adminNav;
  const businesses = useMemo(() => getBusinesses(lang), [lang]);

  // Load real data from FastAPI backend
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [dashData, prodData, campData, leadData, tgData] = await Promise.all([
          api.getDashboard().catch(() => null),
          api.getProducts().catch(() => []),
          api.getCampaigns().catch(() => []),
          api.getLeads().catch(() => []),
          api.getTelegramSettings().catch(() => null),
        ]);
        setDashboard(dashData);
        setProducts(prodData);
        setCampaigns(campData);
        setLeads(leadData);
        setTelegram(tgData);
      } catch (err: any) {
        setErrorMsg(err.message || "Backend bilan ulanishda xatolik");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshKey]);

  const refreshAll = () => setRefreshKey((prev) => prev + 1);

  const filteredLeads = useMemo(
    () => leads.filter((l) => `${l.customer_name} ${l.phone} ${l.instagram_username} ${l.ai_summary}`.toLowerCase().includes(query.toLowerCase())),
    [leads, query]
  );

  const filteredBusinesses = useMemo(
    () => businesses.filter((b) => Object.values(b).join(" ").toLowerCase().includes(query.toLowerCase())),
    [businesses, query]
  );

  function switchRole(nextRole: Role) {
    setRole(nextRole);
    setView(nextRole === "owner" ? "Command" : "Platform");
  }

  return (
    <main className={`appShell theme-${theme}`}>
      <aside className="sideRail" aria-label="Primary navigation">
        <div className="brandLockup">
          <div className="brandGlyph"><Instagram size={20} /></div>
          <div>
            <strong>InstaSales AI</strong>
            <span>{c.brandSubtitle}</span>
          </div>
        </div>

        <div className="roleSwitch" aria-label="Dashboard role">
          <button className={role === "owner" ? "selected" : ""} onClick={() => switchRole("owner")}>{c.owner}</button>
          <button className={role === "admin" ? "selected" : ""} onClick={() => switchRole("admin")}>{c.admin}</button>
        </div>

        <nav className="navStack">
          {activeNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={view === item.label ? "navButton active" : "navButton"}
                key={item.label}
                onClick={() => setView(item.label)}
              >
                <Icon size={18} />
                <span>{c.nav[item.label]}</span>
              </button>
            );
          })}
        </nav>

        <div className="railCard">
          <ShieldCheck size={18} />
          <strong>{c.securityTitle}</strong>
          <span>{c.securityText}</span>
        </div>
      </aside>

      <section className="workspace">
        <Topbar
          c={c}
          lang={lang}
          role={role}
          setLang={setLang}
          setQuery={setQuery}
          setTheme={setTheme}
          theme={theme}
          query={query}
          view={view}
          onRunFlow={() => setShowTestFlowModal(true)}
          onRefresh={refreshAll}
          loading={loading}
        />

        {errorMsg && (
          <div style={{ margin: "1rem 2rem 0", padding: "0.75rem 1rem", borderRadius: "8px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", fontSize: "0.9rem" }}>
            ❌ {errorMsg}
          </div>
        )}

        {role === "owner" ? (
          <OwnerDashboard
            c={c}
            view={view as OwnerView}
            dashboard={dashboard}
            products={products}
            campaigns={campaigns}
            leads={filteredLeads}
            telegram={telegram}
            loading={loading}
            onAddProduct={() => { setEditingProduct(null); setShowProductModal(true); }}
            onEditProduct={(p) => { setEditingProduct(p); setShowProductModal(true); }}
            onDeleteProduct={async (id) => {
              if (confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) {
                await api.deleteProduct(id);
                refreshAll();
              }
            }}
            onAddCampaign={() => setShowCampaignModal(true)}
            onDeleteCampaign={async (id) => {
              if (confirm("Kampaniyani o'chirishni tasdiqlaysizmi?")) {
                await api.deleteCampaign(id);
                refreshAll();
              }
            }}
            onUpdateLeadStatus={async (id, status) => {
              await api.updateLeadStatus(id, status);
              refreshAll();
            }}
            onTestTelegram={async () => {
              try {
                const res = await api.testTelegram();
                alert(`✅ Telegram Test O'tdi!\n\nXabar:\n${res.message_preview}`);
              } catch (e: any) {
                alert(`❌ Telegram Testida Xatolik: ${e.message}`);
              }
            }}
            onSaveTelegram={async (botUsername, chatId) => {
              await api.saveTelegramSettings({ bot_username: botUsername, chat_id: chatId, notification_enabled: true });
              alert("✅ Telegram sozlamalari saqlandi!");
              refreshAll();
            }}
          />
        ) : (
          <AdminDashboard c={c} view={view as AdminView} businesses={filteredBusinesses} />
        )}
      </section>

      {/* MODALS */}
      {showTestFlowModal && (
        <TestFlowModal
          onClose={() => setShowTestFlowModal(false)}
          onSuccess={() => refreshAll()}
        />
      )}

      {showProductModal && (
        <ProductModal
          initialProduct={editingProduct}
          onClose={() => setShowProductModal(false)}
          onSave={async (data) => {
            if (editingProduct) {
              await api.updateProduct(editingProduct.id, data);
            } else {
              await api.createProduct(data);
            }
            setShowProductModal(false);
            refreshAll();
          }}
        />
      )}

      {showCampaignModal && (
        <CampaignModal
          products={products}
          onClose={() => setShowCampaignModal(false)}
          onSave={async (data) => {
            await api.createCampaign(data);
            setShowCampaignModal(false);
            refreshAll();
          }}
        />
      )}
    </main>
  );
}

function Topbar({
  c,
  lang,
  role,
  query,
  setLang,
  setQuery,
  setTheme,
  theme,
  view,
  onRunFlow,
  onRefresh,
  loading,
}: {
  c: typeof copy[Lang];
  lang: Lang;
  role: Role;
  query: string;
  setLang: (value: Lang) => void;
  setQuery: (value: string) => void;
  setTheme: (value: Theme) => void;
  theme: Theme;
  view: View;
  onRunFlow: () => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{role === "owner" ? c.ownerWorkspace : c.platformCommand}</p>
        <h1>{role === "owner" ? c.ownerHeadline : c.adminHeadline}</h1>
        <span className="viewCrumb">{c.nav[view]}</span>
      </div>
      <div className="topActions">
        <label className="selectField" aria-label={c.language}>
          <Languages size={17} />
          <select value={lang} onChange={(event) => setLang(event.target.value as Lang)}>
            {languageOptions.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <button
          className="themeToggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={c.theme}
        >
          {theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}
          <span>{theme === "dark" ? c.dark : c.light}</span>
        </button>
        <label className="searchField">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c.search} />
        </label>
        <button className="iconButton" onClick={onRefresh} title="Ma'lumotlarni yangilash">
          <RefreshCw size={18} className={loading ? "spin" : ""} />
        </button>
        <button className="primaryButton" onClick={onRunFlow}>
          <Zap size={17} /> {c.runFlow}
        </button>
      </div>
    </header>
  );
}

function OwnerDashboard({
  c,
  view,
  dashboard,
  products,
  campaigns,
  leads,
  telegram,
  loading,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddCampaign,
  onDeleteCampaign,
  onUpdateLeadStatus,
  onTestTelegram,
  onSaveTelegram,
}: {
  c: typeof copy[Lang];
  view: OwnerView;
  dashboard: DashboardSummary | null;
  products: APIProduct[];
  campaigns: APICampaign[];
  leads: APILead[];
  telegram: TelegramSettings | null;
  loading: boolean;
  onAddProduct: () => void;
  onEditProduct: (product: APIProduct) => void;
  onDeleteProduct: (id: string) => void;
  onAddCampaign: () => void;
  onDeleteCampaign: (id: string) => void;
  onUpdateLeadStatus: (id: string, status: string) => void;
  onTestTelegram: () => void;
  onSaveTelegram: (botUsername: string, chatId: string) => void;
}) {
  if (view === "Leads") return <LeadsBoard c={c} leads={leads} onUpdateStatus={onUpdateLeadStatus} />;
  if (view === "Campaigns") return <CampaignsBoard c={c} campaigns={campaigns} products={products} onAdd={onAddCampaign} onDelete={onDeleteCampaign} />;
  if (view === "Integrations") return <IntegrationsBoard c={c} telegram={telegram} onTestTelegram={onTestTelegram} onSaveTelegram={onSaveTelegram} />;
  if (view === "AI Rules") return <AIRulesBoard c={c} />;
  if (view === "Products") return <ProductsBoard c={c} products={products} onAdd={onAddProduct} onEdit={onEditProduct} onDelete={onDeleteProduct} />;
  if (view === "Conversations") return <ConversationsBoard c={c} leads={leads} />;

  return (
    <>
      <section className="heroGrid">
        <article className="heroPanel">
          <div className="heroCopy">
            <span className="softBadge"><Sparkles size={14} /> {c.heroBadge}</span>
            <h2>{c.heroTitle}</h2>
            <p>{c.heroText}</p>
          </div>
          <WorkflowMap c={c} />
        </article>
        <MobilePreview c={c} leads={leads} />
      </section>

      <MetricGrid
        items={[
          { label: c.metrics.todayLeads, value: dashboard ? String(dashboard.today_leads) : "0", delta: "+100%", icon: UsersRound },
          { label: c.metrics.aiConversations, value: dashboard ? String(dashboard.ai_conversations) : "0", delta: "+31%", icon: Bot },
          { label: c.metrics.replySuccess, value: "99.8%", delta: c.metrics.healthy, icon: Send },
          { label: c.metrics.activeCampaigns, value: dashboard ? String(dashboard.active_campaigns) : "0", delta: `${campaigns.length} ${c.metrics.total}`, icon: Target },
        ]}
      />

      <section className="contentGrid">
        <LeadsPanel c={c} leads={leads.slice(0, 5)} onUpdateStatus={onUpdateLeadStatus} />
        <CampaignFlowPanel c={c} campaigns={campaigns} products={products} onAdd={onAddCampaign} onDelete={onDeleteCampaign} />
        <ConversationPanel c={c} leads={leads} />
        <GuardrailPanel c={c} />
      </section>
    </>
  );
}

function AdminDashboard({ c, view, businesses }: { c: typeof copy[Lang]; view: AdminView; businesses: Business[] }) {
  if (view === "Businesses") return <BusinessBoard c={c} businesses={businesses} />;
  if (view === "System Health") return <SystemHealthBoard c={c} />;
  if (view === "Audit") return <AuditBoard c={c} />;
  return (
    <>
      <section className="adminHero">
        <div>
          <span className="softBadge"><Activity size={14} /> {c.adminHeroBadge}</span>
          <h2>{c.adminHeroTitle}</h2>
          <p>{c.adminHeroText}</p>
        </div>
        <div className="radialScore" aria-label={c.healthScore}>
          <span>{c.platform}</span>
          <strong>98</strong>
          <small>{c.healthScore}</small>
        </div>
      </section>
      <MetricGrid
        items={[
          { label: c.metrics.businesses, value: "14", delta: `+3 ${c.metrics.thisMonth}`, icon: Building2 },
          { label: c.metrics.totalLeads, value: "8.4k", delta: "+22%", icon: UsersRound },
          { label: c.metrics.webhookUptime, value: "99.9%", delta: c.metrics.stable, icon: Activity },
          { label: c.metrics.securityAlerts, value: "0", delta: c.metrics.healthy, icon: ShieldCheck },
        ]}
      />
      <section className="contentGrid">
        <BusinessPanel c={c} businesses={businesses} />
        <SystemPanel c={c} />
        <AuditPanel c={c} />
        <TenantFlowPanel c={c} />
      </section>
    </>
  );
}

function WorkflowMap({ c }: { c: typeof copy[Lang] }) {
  return (
    <div className="workflowMap" aria-label="Automation workflow">
      {c.workflow.map((label, index) => (
        <div className={`flowNode ${["blue", "violet", "pink", "amber", "green", "blue"][index]}`} key={label}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{label}</strong>
          <small>{c.workflowValues[index]}</small>
        </div>
      ))}
    </div>
  );
}

function MobilePreview({ c, leads }: { c: typeof copy[Lang]; leads: APILead[] }) {
  const topLead = leads[0];
  return (
    <article className="mobilePreview">
      <div className="phoneTop">
        <span>{c.liveLead}</span>
        <strong>{topLead ? topLead.customer_name : "LD-1028"}</strong>
      </div>
      <div className="phoneHero">
        <Instagram size={22} />
        <strong>55</strong>
        <span>{c.mobileCampaign}</span>
      </div>
      <div className="phoneStats">
        <div><span>{c.reply}</span><strong>99.8%</strong></div>
        <div><span>{c.value}</span><strong>3.9m</strong></div>
      </div>
      <div className="phoneNav" aria-label="Mobile navigation preview">
        <Gauge size={16} />
        <UsersRound size={16} />
        <MessageCircle size={16} />
        <ShieldCheck size={16} />
      </div>
    </article>
  );
}

function MetricGrid({ items }: { items: { label: string; value: string; delta: string; icon: typeof Gauge }[] }) {
  return (
    <section className="metricGrid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article className="metricCard" key={item.label}>
            <div className="metricIcon"><Icon size={19} /></div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.delta}</small>
          </article>
        );
      })}
    </section>
  );
}

function LeadsPanel({ c, leads, onUpdateStatus }: { c: typeof copy[Lang]; leads: APILead[]; onUpdateStatus: (id: string, s: string) => void }) {
  return (
    <article className="panel wide">
      <PanelHead label={c.panels.crmLeads} title={c.panels.latestCustomers} action={c.panels.openLeads} />
      <LeadTable c={c} leads={leads} onUpdateStatus={onUpdateStatus} />
    </article>
  );
}

function LeadTable({ c, leads, onUpdateStatus }: { c: typeof copy[Lang]; leads: APILead[]; onUpdateStatus: (id: string, s: string) => void }) {
  if (leads.length === 0) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>Hozircha hech qanday lead mavjud emas. Yuqoridagi "Run test flow" orqali test qiling!</div>;
  }
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>{c.table.customer}</th>
            <th>{c.table.phone}</th>
            <th>Instagram</th>
            <th>AI Summary</th>
            <th>{c.table.status}</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td data-label={c.table.customer}><strong>{lead.customer_name}</strong></td>
              <td data-label={c.table.phone}><code>{lead.phone}</code></td>
              <td>@{lead.instagram_username}</td>
              <td style={{ maxWidth: "300px", fontSize: "0.85rem" }}>{lead.ai_summary || "Izoh yo'q"}</td>
              <td data-label={c.table.status}>
                <select
                  value={lead.status}
                  onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                  className="statusPill success"
                  style={{ border: "none", background: "rgba(16, 185, 129, 0.15)", cursor: "pointer", fontWeight: 600, padding: "4px 8px" }}
                >
                  <option value="new">Yangi</option>
                  <option value="contacted">Bog'lanildi</option>
                  <option value="qualified">Qualified</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CampaignFlowPanel({
  c,
  campaigns,
  products,
  onAdd,
  onDelete,
}: {
  c: typeof copy[Lang];
  campaigns: APICampaign[];
  products: APIProduct[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="panel">
      <div className="panelHead">
        <div>
          <span className="sectionLabel">{c.panels.campaigns}</span>
          <h3>{c.panels.keywordRoutes}</h3>
        </div>
        <button className="primaryButton" onClick={onAdd} style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
          <Plus size={15} /> Qo'shish
        </button>
      </div>
      <div className="campaignStack">
        {campaigns.length === 0 ? (
          <div style={{ padding: "1rem", color: "#6b7280", textAlign: "center" }}>Kampaniyalar topilmadi</div>
        ) : (
          campaigns.map((campaign) => {
            const product = products.find((p) => p.id === campaign.product_id);
            return (
              <div className="campaignCard" key={campaign.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{campaign.name}</strong>
                  <span>{product ? product.name : "Mahsulot ulanmagan"}</span>
                  <div style={{ marginTop: "4px", fontSize: "0.8rem", color: "#9ca3af" }}>
                    DM: "{campaign.first_dm_message.substring(0, 45)}..."
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <code style={{ fontSize: "1rem", padding: "2px 8px", background: "rgba(99, 102, 241, 0.2)", borderRadius: "4px" }}>
                    {campaign.keyword}
                  </code>
                  <button onClick={() => onDelete(campaign.id)} className="iconButton" style={{ color: "#ef4444" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}

function ConversationPanel({ c, leads }: { c: typeof copy[Lang]; leads: APILead[] }) {
  const topLead = leads[0];
  return (
    <article className="panel">
      <PanelHead label={c.panels.conversation} title={c.panels.transcript} action={c.panels.review} />
      <div className="chatStack">
        <div className="chatBubble customer"><span>Mijoz (@akmal_mebel)</span><p>55</p></div>
        <div className="chatBubble ai"><span>AI Assistant</span><p>Assalomu alaykum! Yumshoq mebel narxi 3 990 000 so'mdan boshlanadi. Qaysi rangiga qiziqayapsiz?</p></div>
        <div className="chatBubble customer"><span>Mijoz (@akmal_mebel)</span><p>Kulrang kerak. Akmal, +998 90 123 45 67</p></div>
        <div className="chatBubble system"><span>Autosell Engine</span><p>✅ Qualified Lead yaratildi. CRM saqlandi va Telegram guruhga yuborildi.</p></div>
      </div>
    </article>
  );
}

function GuardrailPanel({ c }: { c: typeof copy[Lang] }) {
  return (
    <article className="panel">
      <PanelHead label={c.panels.guardrails} title={c.panels.productOnly} action={c.panels.tune} />
      <div className="ruleList">
        {c.rules.map((rule) => (
          <div key={rule}><CheckCircle2 size={16} /><span>{rule}</span></div>
        ))}
      </div>
    </article>
  );
}

function LeadsBoard({ c, leads, onUpdateStatus }: { c: typeof copy[Lang]; leads: APILead[]; onUpdateStatus: (id: string, s: string) => void }) {
  return <section className="singleColumn"><LeadsPanel c={c} leads={leads} onUpdateStatus={onUpdateStatus} /></section>;
}

function CampaignsBoard({ c, campaigns, products, onAdd, onDelete }: { c: typeof copy[Lang]; campaigns: APICampaign[]; products: APIProduct[]; onAdd: () => void; onDelete: (id: string) => void }) {
  return <section className="singleColumn"><CampaignFlowPanel c={c} campaigns={campaigns} products={products} onAdd={onAdd} onDelete={onDelete} /></section>;
}

function ProductsBoard({
  c,
  products,
  onAdd,
  onEdit,
  onDelete,
}: {
  c: typeof copy[Lang];
  products: APIProduct[];
  onAdd: () => void;
  onEdit: (p: APIProduct) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="singleColumn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2>Mahsulotlar Katalogi ({products.length})</h2>
          <p style={{ color: "#9ca3af" }}>AI faqat ushbu mahsulot kartochkalaridagi ma'lumotlar bo'yicha mijozga javob beradi.</p>
        </div>
        <button className="primaryButton" onClick={onAdd}>
          <Plus size={17} /> Yangi Mahsulot Qo'shish
        </button>
      </div>
      <div className="cardsGrid">
        {products.map((product) => (
          <article className="panel productCard" key={product.id} style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Package size={24} style={{ color: "#6366f1" }} />
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => onEdit(product)} className="ghostButton" style={{ padding: "4px 8px", fontSize: "0.8rem" }}>Tahrirlash</button>
                <button onClick={() => onDelete(product.id)} className="ghostButton" style={{ padding: "4px 8px", fontSize: "0.8rem", color: "#ef4444" }}><Trash2 size={15} /></button>
              </div>
            </div>
            <strong style={{ fontSize: "1.2rem", marginTop: "8px" }}>{product.name}</strong>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981" }}>
              {product.price.toLocaleString()} UZS
              {product.discount_price ? <small style={{ textDecoration: "line-through", color: "#9ca3af", marginLeft: "8px" }}>{product.discount_price.toLocaleString()} UZS</small> : null}
            </span>
            <p style={{ marginTop: "8px", fontSize: "0.9rem", color: "#d1d5db" }}>{product.description}</p>
            {product.delivery_info && (
              <div style={{ fontSize: "0.85rem", color: "#818cf8", marginTop: "6px" }}>🚚 {product.delivery_info}</div>
            )}
            {product.variants && product.variants.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                {product.variants.map((v) => (
                  <span key={v} style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.1)" }}>{v}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function ConversationsBoard({ c, leads }: { c: typeof copy[Lang]; leads: APILead[] }) {
  return (
    <section className="contentGrid">
      <ConversationPanel c={c} leads={leads} />
      <article className="panel">
        <PanelHead label={c.panels.inbox} title={c.panels.activeConversations} action={c.panels.filter} />
        <div className="campaignStack">
          {leads.map((lead) => (
            <div className="campaignCard" key={lead.id}>
              <div><strong>{lead.customer_name} (@{lead.instagram_username})</strong><span>{lead.ai_summary || lead.phone}</span></div>
              <ChevronRight size={17} />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function IntegrationsBoard({
  c,
  telegram,
  onTestTelegram,
  onSaveTelegram,
}: {
  c: typeof copy[Lang];
  telegram: TelegramSettings | null;
  onTestTelegram: () => void;
  onSaveTelegram: (botUsername: string, chatId: string) => void;
}) {
  const [botUsername, setBotUsername] = useState(telegram?.bot_username || "@autosell_demo_bot");
  const [chatId, setChatId] = useState(telegram?.chat_id || "-100123456789");

  useEffect(() => {
    if (telegram) {
      if (telegram.bot_username) setBotUsername(telegram.bot_username);
      if (telegram.chat_id) setChatId(telegram.chat_id);
    }
  }, [telegram]);

  return (
    <section className="singleColumn">
      <div className="cardsGrid" style={{ marginBottom: "2rem" }}>
        <article className="panel integrationCard">
          <Instagram size={24} style={{ color: "#ec4899" }} />
          <strong>Instagram Business API</strong>
          <span style={{ color: "#10b981" }}>✅ Webhook verification sozlangan</span>
          <button className="ghostButton">Qayta ulanish</button>
        </article>

        <article className="panel integrationCard">
          <Send size={24} style={{ color: "#3b82f6" }} />
          <strong>Telegram Group Notifications</strong>
          <span style={{ color: telegram?.notification_enabled ? "#10b981" : "#f59e0b" }}>
            {telegram?.notification_enabled ? "✅ Telegram bot faol" : "⚠️ Ulangan emas"}
          </span>
          <button className="primaryButton" onClick={onTestTelegram} style={{ padding: "4px 10px", fontSize: "0.85rem" }}>
            Test Xabar Yuborish
          </button>
        </article>
      </div>

      <article className="panel wide">
        <div className="panelHead">
          <div>
            <span className="sectionLabel">Telegram Integratsiya Sozlamalari</span>
            <h3>Bot Token va Chat ID</h3>
          </div>
        </div>
        <div style={{ display: "grid", gap: "1rem", maxWidth: "500px", marginTop: "1rem" }}>
          <label style={{ display: "grid", gap: "6px" }}>
            <span style={{ fontSize: "0.9rem", color: "#9ca3af" }}>Telegram Bot Username:</span>
            <input
              type="text"
              value={botUsername}
              onChange={(e) => setBotUsername(e.target.value)}
              placeholder="@my_sales_bot"
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "#fff" }}
            />
          </label>
          <label style={{ display: "grid", gap: "6px" }}>
            <span style={{ fontSize: "0.9rem", color: "#9ca3af" }}>Telegram Group Chat ID:</span>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="-100123456789"
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #374151", background: "#1f2937", color: "#fff" }}
            />
          </label>
          <button className="primaryButton" onClick={() => onSaveTelegram(botUsername, chatId)} style={{ justifySelf: "start" }}>
            Sozlamalarni Saqlash
          </button>
        </div>
      </article>
    </section>
  );
}

function AIRulesBoard({ c }: { c: typeof copy[Lang] }) {
  return (
    <section className="contentGrid">
      <GuardrailPanel c={c} />
      <article className="panel wide">
        <PanelHead label={c.panels.promptPolicy} title={c.panels.behavior} action={c.panels.save} />
        <div className="promptBox">
          <p>{c.prompt}</p>
        </div>
      </article>
    </section>
  );
}

function BusinessPanel({ c, businesses }: { c: typeof copy[Lang]; businesses: Business[] }) {
  return (
    <article className="panel wide">
      <PanelHead label={c.panels.tenants} title={c.panels.businessAccounts} action={c.panels.openAll} />
      <div className="tableWrap">
        <table>
          <thead>
            <tr><th>{c.table.business}</th><th>{c.table.owner}</th><th>{c.table.plan}</th><th>{c.table.leads}</th><th>{c.table.health}</th><th>{c.table.status}</th></tr>
          </thead>
          <tbody>
            {businesses.map((business, index) => (
              <tr key={business.name}>
                <td data-label={c.table.business}><strong>{business.name}</strong><span>{c.table.tenantWorkspace}</span></td>
                <td data-label={c.table.owner}>{business.owner}</td>
                <td data-label={c.table.plan}>{business.plan}</td>
                <td data-label={c.table.leads}>{business.leads}</td>
                <td data-label={c.table.health}>{business.health}</td>
                <td data-label={c.table.status}><span className={index < 2 ? "statusPill success" : "statusPill"}>{business.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function BusinessBoard({ c, businesses }: { c: typeof copy[Lang]; businesses: Business[] }) {
  return <section className="singleColumn"><BusinessPanel c={c} businesses={businesses} /></section>;
}

function SystemPanel({ c }: { c: typeof copy[Lang] }) {
  return (
    <article className="panel">
      <PanelHead label={c.panels.system} title={c.panels.runtimeHealth} action={c.panels.inspect} />
      <div className="healthStack">
        {c.healthItems.map((item) => (
          <div key={item}><CheckCircle2 size={16} /><span>{item}</span></div>
        ))}
      </div>
    </article>
  );
}

function AuditPanel({ c }: { c: typeof copy[Lang] }) {
  return (
    <article className="panel">
      <PanelHead label={c.panels.audit} title={c.panels.securityEvents} action={c.panels.viewLog} />
      <div className="auditList">
        {c.auditItems.map((item) => (
          <div key={item}><ShieldCheck size={16} /><span>{item}</span></div>
        ))}
      </div>
    </article>
  );
}

function TenantFlowPanel({ c }: { c: typeof copy[Lang] }) {
  return (
    <article className="panel">
      <PanelHead label={c.panels.tenantFlow} title={c.panels.executionLayer} action={c.panels.trace} />
      <WorkflowMap c={c} />
    </article>
  );
}

function SystemHealthBoard({ c }: { c: typeof copy[Lang] }) {
  return <section className="contentGrid"><SystemPanel c={c} /><TenantFlowPanel c={c} /></section>;
}

function AuditBoard({ c }: { c: typeof copy[Lang] }) {
  return <section className="contentGrid"><AuditPanel c={c} /><SystemPanel c={c} /></section>;
}

function PanelHead({ label, title, action }: { label: string; title: string; action: string }) {
  return (
    <div className="panelHead">
      <div>
        <span className="sectionLabel">{label}</span>
        <h3>{title}</h3>
      </div>
      <button className="ghostButton">{action} <ArrowUpRight size={15} /></button>
    </div>
  );
}

// MODAL COMPONENTS
function TestFlowModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [keyword, setKeyword] = useState("55");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.runTestWebhook(keyword);
      setResult(res);
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Test xatoga uchradi");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
      <div style={{ background: "#1e1e2e", border: "1px solid #313244", borderRadius: "12px", width: "100%", maxWidth: "550px", padding: "1.5rem", color: "#cdd6f4" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem" }}>
            <Zap size={20} color="#f9e2af" /> Instagram Comment-to-DM Live Flow
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#a6adc8", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <p style={{ fontSize: "0.9rem", color: "#bac2de", marginBottom: "1rem" }}>
          Instagram post ostidagi izohni simulyatsiya qiling. AI kalit so'zni (keyword) aniqlaydi, Private Reply DM yuboradi va Telegramga xabar beradi!
        </p>

        <label style={{ display: "grid", gap: "6px", marginBottom: "1.2rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Izoh / Kalit So'z (Keyword):</span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="masalan: 55"
            style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#cdd6f4", fontSize: "1rem" }}
          />
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} className="ghostButton">Yopish</button>
          <button onClick={handleRun} disabled={running} className="primaryButton">
            {running ? <RefreshCw size={16} className="spin" /> : <Zap size={16} />} Flow'ni Ishga Tushirish
          </button>
        </div>

        {error && <div style={{ marginTop: "1rem", padding: "10px", background: "#f38ba822", border: "1px solid #f38ba8", color: "#f38ba8", borderRadius: "6px" }}>❌ {error}</div>}

        {result && (
          <div style={{ marginTop: "1.2rem", padding: "12px", background: "#181825", border: "1px solid #a6e3a1", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#a6e3a1", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={18} /> Simulyatsiya Muvaffaqiyatli!
            </h4>
            <div style={{ fontSize: "0.85rem", display: "grid", gap: "6px", color: "#cdd6f4" }}>
              <div><strong>Status:</strong> {result.status}</div>
              {result.private_reply_preview && (
                <div><strong>Private Reply DM:</strong> <p style={{ background: "#11111b", padding: "8px", borderRadius: "4px", margin: "4px 0" }}>{result.private_reply_preview}</p></div>
              )}
              {result.reason && <div><strong>Sabab:</strong> {result.reason}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductModal({ initialProduct, onClose, onSave }: { initialProduct: APIProduct | null; onClose: () => void; onSave: (data: Omit<APIProduct, "id">) => void }) {
  const [name, setName] = useState(initialProduct?.name || "");
  const [price, setPrice] = useState(initialProduct?.price ? String(initialProduct.price) : "");
  const [discountPrice, setDiscountPrice] = useState(initialProduct?.discount_price ? String(initialProduct.discount_price) : "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [deliveryInfo, setDeliveryInfo] = useState(initialProduct?.delivery_info || "");
  const [variantsStr, setVariantsStr] = useState(initialProduct?.variants ? initialProduct.variants.join(", ") : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      price: parseFloat(price) || 0,
      discount_price: discountPrice ? parseFloat(discountPrice) : undefined,
      description,
      delivery_info: deliveryInfo,
      variants: variantsStr.split(",").map((s) => s.trim()).filter(Boolean),
      faq: initialProduct?.faq || [{ question: "Kafolat bormi?", answer: "Ha, 2 yil rasmiy kafolat beriladi." }],
      status: "active",
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
      <form onSubmit={handleSubmit} style={{ background: "#1e1e2e", border: "1px solid #313244", borderRadius: "12px", width: "100%", maxWidth: "500px", padding: "1.5rem", color: "#cdd6f4" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>{initialProduct ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot Qo'shish"}</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#a6adc8", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div style={{ display: "grid", gap: "10px" }}>
          <label>
            <span style={{ fontSize: "0.85rem" }}>Mahsulot nomi:</span>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#fff" }} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <label>
              <span style={{ fontSize: "0.85rem" }}>Asosiy Narx (UZS):</span>
              <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#fff" }} />
            </label>
            <label>
              <span style={{ fontSize: "0.85rem" }}>Chegirma narxi (ixtiyoriy):</span>
              <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#fff" }} />
            </label>
          </div>
          <label>
            <span style={{ fontSize: "0.85rem" }}>Tavsifi:</span>
            <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#fff" }} />
          </label>
          <label>
            <span style={{ fontSize: "0.85rem" }}>Dostavka ma'lumoti:</span>
            <input type="text" value={deliveryInfo} onChange={(e) => setDeliveryInfo(e.target.value)} placeholder="Toshkent ichida 24 soatda bepul" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#fff" }} />
          </label>
          <label>
            <span style={{ fontSize: "0.85rem" }}>Variantlar (vergul bilan ajratilgan):</span>
            <input type="text" value={variantsStr} onChange={(e) => setVariantsStr(e.target.value)} placeholder="Kulrang, Qora, Jigarrang" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#fff" }} />
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1.2rem" }}>
          <button type="button" onClick={onClose} className="ghostButton">Bekor qilish</button>
          <button type="submit" className="primaryButton">Saqlash</button>
        </div>
      </form>
    </div>
  );
}

function CampaignModal({ products, onClose, onSave }: { products: APIProduct[]; onClose: () => void; onSave: (data: Omit<APICampaign, "id" | "normalized_keyword">) => void }) {
  const [name, setName] = useState("");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [keyword, setKeyword] = useState("");
  const [firstDmMessage, setFirstDmMessage] = useState("Assalomu alaykum! Mahsulot narxi va tavsifi bilan tanishdingizmi? Qaysi varianti kerak?");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      alert("Iltimos avval mahsulot tanlang!");
      return;
    }
    onSave({
      name,
      product_id: productId,
      keyword,
      first_dm_message: firstDmMessage,
      auto_dm_enabled: true,
      status: "active",
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
      <form onSubmit={handleSubmit} style={{ background: "#1e1e2e", border: "1px solid #313244", borderRadius: "12px", width: "100%", maxWidth: "500px", padding: "1.5rem", color: "#cdd6f4" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Yangi Kampaniya Qo'shish</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#a6adc8", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div style={{ display: "grid", gap: "10px" }}>
          <label>
            <span style={{ fontSize: "0.85rem" }}>Kampaniya Nomi:</span>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Yumshoq mebel aksiyasi" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#fff" }} />
          </label>
          <label>
            <span style={{ fontSize: "0.85rem" }}>Bog'lanadigan Mahsulot:</span>
            <select required value={productId} onChange={(e) => setProductId(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#fff" }}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString()} UZS)</option>
              ))}
            </select>
          </label>
          <label>
            <span style={{ fontSize: "0.85rem" }}>Kalit So'z (Keyword):</span>
            <input required type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="55" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#fff" }} />
          </label>
          <label>
            <span style={{ fontSize: "0.85rem" }}>Birinchi DM xabari:</span>
            <textarea required rows={3} value={firstDmMessage} onChange={(e) => setFirstDmMessage(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #45475a", background: "#11111b", color: "#fff" }} />
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1.2rem" }}>
          <button type="button" onClick={onClose} className="ghostButton">Bekor qilish</button>
          <button type="submit" className="primaryButton">Saqlash</button>
        </div>
      </form>
    </div>
  );
}
