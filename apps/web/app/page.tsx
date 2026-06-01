"use client";

import { useMemo, useState } from "react";
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
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  UsersRound,
  Zap,
} from "lucide-react";

type Role = "owner" | "admin";
type Theme = "dark" | "light";
type Lang = "en" | "uz" | "ru";
type OwnerView = "Command" | "Leads" | "Conversations" | "Products" | "Campaigns" | "Integrations" | "AI Rules";
type AdminView = "Platform" | "Businesses" | "System Health" | "Audit";
type View = OwnerView | AdminView;

type Lead = {
  id: string;
  name: string;
  handle: string;
  phone: string;
  product: string;
  keyword: string;
  status: string;
  value: string;
  summary: string;
};

type Campaign = {
  name: string;
  product: string;
  keyword: string;
  leads: number;
  status: string;
};

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
    products: ["Soft furniture", "Kitchen furniture", "Office chair"],
    prices: ["from 3 990 000 UZS", "from 8 900 000 UZS", "from 1 250 000 UZS"],
    productText: "AI responses use only this product card: price, variant, delivery and FAQ.",
    leadSummaries: [
      "Interested in the gray variant and shared a phone number.",
      "Asked about price and delivery time, expects a call tomorrow.",
      "Interested in 8 office chairs for a company purchase.",
      "Asked about delivery and warranty conditions.",
    ],
    campaigns: ["May soft furniture campaign", "Kitchen sets reels", "Office chair retarget"],
    chat: {
      customer: "Customer",
      ai: "AI",
      system: "System",
      first: "55",
      second: "Hello! Soft furniture starts from 3 990 000 UZS.",
      third: "I need gray. Akmal, +998 90 123 45 67",
      fourth: "Lead saved to CRM and sent to the Telegram group.",
    },
    rules: ["Does not guess products", "Does not ask for email or address", "Extracts name and phone", "Creates summary for Telegram"],
    integrations: [
      ["Instagram", "OAuth connected"],
      ["Telegram", "Test message passed"],
      ["Webhook", "Verify token ready"],
      ["Encryption", "AES-256-GCM enabled"],
    ],
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
    products: ["Yumshoq mebel", "Oshxona mebeli", "Ofis kreslosi"],
    prices: ["3 990 000 so'mdan", "8 900 000 so'mdan", "1 250 000 so'mdan"],
    productText: "AI javoblari faqat shu product carddagi narx, variant, delivery va FAQ asosida ishlaydi.",
    leadSummaries: [
      "Kulrang variantga qiziqdi, telefon qoldirdi.",
      "Narx va muddatni so'radi, ertaga qo'ng'iroq kutmoqda.",
      "8 dona kresloga qiziqdi, kompaniya uchun olmoqchi.",
      "Dostavka va kafolat shartlarini so'radi.",
    ],
    campaigns: ["May oyi yumshoq mebel reklamasi", "Oshxona komplektlari reels", "Ofis kreslosi retarget"],
    chat: {
      customer: "Mijoz",
      ai: "AI",
      system: "System",
      first: "55",
      second: "Assalomu alaykum! Yumshoq mebel narxi 3 990 000 so'mdan boshlanadi.",
      third: "Kulrang kerak. Akmal, +998 90 123 45 67",
      fourth: "Lead CRM'ga saqlandi va Telegram guruhga yuborildi.",
    },
    rules: ["Mahsulotni taxmin qilmaydi", "Email va manzil so'ramaydi", "Ism va telefonni ajratadi", "Telegram uchun summary beradi"],
    integrations: [
      ["Instagram", "OAuth ulangan"],
      ["Telegram", "Test xabar o'tdi"],
      ["Webhook", "Verify token tayyor"],
      ["Encryption", "AES-256-GCM yoqilgan"],
    ],
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
    products: ["Мягкая мебель", "Кухонная мебель", "Офисное кресло"],
    prices: ["от 3 990 000 сум", "от 8 900 000 сум", "от 1 250 000 сум"],
    productText: "AI ответы используют только эту product card: цена, вариант, доставка и FAQ.",
    leadSummaries: [
      "Интересуется серым вариантом, оставил телефон.",
      "Спросила цену и срок, ждет звонок завтра.",
      "Интересуется 8 креслами для компании.",
      "Спросила условия доставки и гарантии.",
    ],
    campaigns: ["Майская кампания мягкой мебели", "Reels кухонных комплектов", "Retarget офисного кресла"],
    chat: {
      customer: "Клиент",
      ai: "AI",
      system: "Система",
      first: "55",
      second: "Здравствуйте! Мягкая мебель начинается от 3 990 000 сум.",
      third: "Нужен серый. Акмал, +998 90 123 45 67",
      fourth: "Лид сохранен в CRM и отправлен в Telegram группу.",
    },
    rules: ["Не угадывает продукт", "Не спрашивает email и адрес", "Извлекает имя и телефон", "Создает summary для Telegram"],
    integrations: [
      ["Instagram", "OAuth подключен"],
      ["Telegram", "Test message прошел"],
      ["Webhook", "Verify token готов"],
      ["Encryption", "AES-256-GCM включен"],
    ],
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

function getLeads(lang: Lang): Lead[] {
  const c = copy[lang];
  return [
    ["LD-1028", "Akmal Karimov", "@akmal_home", "+998 90 123 45 67", c.products[0], "55", c.statuses.new, "3 990 000", c.leadSummaries[0]],
    ["LD-1027", "Dilnoza Saidova", "@dilnoza.design", "+998 93 771 20 90", c.products[1], "77", c.statuses.contacted, "8 900 000", c.leadSummaries[1]],
    ["LD-1026", "Jasur Aliyev", "@jasur.office", "+998 99 502 18 44", c.products[2], "88", c.statuses.qualified, "10 000 000", c.leadSummaries[2]],
    ["LD-1025", "Madina Store", "@madina.store", "+998 94 221 11 08", c.products[0], "55", c.statuses.new, "3 990 000", c.leadSummaries[3]],
  ].map(([id, name, handle, phone, product, keyword, status, value, summary]) => ({
    id,
    name,
    handle,
    phone,
    product,
    keyword,
    status,
    value,
    summary,
  }));
}

function getCampaigns(lang: Lang): Campaign[] {
  const c = copy[lang];
  return [
    { name: c.campaigns[0], product: c.products[0], keyword: "55", leads: 84, status: c.statuses.active },
    { name: c.campaigns[1], product: c.products[1], keyword: "77", leads: 42, status: c.statuses.active },
    { name: c.campaigns[2], product: c.products[2], keyword: "88", leads: 19, status: c.statuses.paused },
  ];
}

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
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const c = copy[lang];

  const activeNav = role === "owner" ? ownerNav : adminNav;
  const leads = useMemo(() => getLeads(lang), [lang]);
  const campaigns = useMemo(() => getCampaigns(lang), [lang]);
  const businesses = useMemo(() => getBusinesses(lang), [lang]);
  const filteredLeads = useMemo(
    () => leads.filter((lead) => Object.values(lead).join(" ").toLowerCase().includes(query.toLowerCase())),
    [leads, query],
  );
  const filteredBusinesses = useMemo(
    () => businesses.filter((business) => Object.values(business).join(" ").toLowerCase().includes(query.toLowerCase())),
    [businesses, query],
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
            <strong>InstaSales</strong>
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
        />
        {role === "owner" ? (
          <OwnerDashboard c={c} view={view as OwnerView} leads={filteredLeads} campaigns={campaigns} />
        ) : (
          <AdminDashboard c={c} view={view as AdminView} businesses={filteredBusinesses} />
        )}
      </section>
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
        <button className="iconButton" aria-label={c.download}><Download size={18} /></button>
        <button className="primaryButton"><Zap size={17} /> {c.runFlow}</button>
      </div>
    </header>
  );
}

function OwnerDashboard({ c, view, leads, campaigns }: { c: typeof copy[Lang]; view: OwnerView; leads: Lead[]; campaigns: Campaign[] }) {
  if (view === "Leads") return <LeadsBoard c={c} leads={leads} />;
  if (view === "Campaigns") return <CampaignsBoard c={c} campaigns={campaigns} />;
  if (view === "Integrations") return <IntegrationsBoard c={c} />;
  if (view === "AI Rules") return <AIRulesBoard c={c} />;
  if (view === "Products") return <ProductsBoard c={c} />;
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
        <MobilePreview c={c} />
      </section>

      <MetricGrid
        items={[
          { label: c.metrics.todayLeads, value: "24", delta: "+18%", icon: UsersRound },
          { label: c.metrics.aiConversations, value: "138", delta: "+31%", icon: Bot },
          { label: c.metrics.replySuccess, value: "96%", delta: c.metrics.healthy, icon: Send },
          { label: c.metrics.activeCampaigns, value: "2", delta: `3 ${c.metrics.total}`, icon: Target },
        ]}
      />

      <section className="contentGrid">
        <LeadsPanel c={c} leads={leads.slice(0, 4)} />
        <CampaignFlowPanel c={c} campaigns={campaigns} />
        <ConversationPanel c={c} />
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
          <strong>94</strong>
          <small>{c.healthScore}</small>
        </div>
      </section>
      <MetricGrid
        items={[
          { label: c.metrics.businesses, value: "14", delta: `+3 ${c.metrics.thisMonth}`, icon: Building2 },
          { label: c.metrics.totalLeads, value: "8.4k", delta: "+22%", icon: UsersRound },
          { label: c.metrics.webhookUptime, value: "99.2%", delta: c.metrics.stable, icon: Activity },
          { label: c.metrics.securityAlerts, value: "2", delta: c.metrics.review, icon: ShieldCheck },
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

function MobilePreview({ c }: { c: typeof copy[Lang] }) {
  return (
    <article className="mobilePreview">
      <div className="phoneTop">
        <span>{c.liveLead}</span>
        <strong>LD-1028</strong>
      </div>
      <div className="phoneHero">
        <Instagram size={22} />
        <strong>55</strong>
        <span>{c.mobileCampaign}</span>
      </div>
      <div className="phoneStats">
        <div><span>{c.reply}</span><strong>96%</strong></div>
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

function LeadsPanel({ c, leads }: { c: typeof copy[Lang]; leads: Lead[] }) {
  return (
    <article className="panel wide">
      <PanelHead label={c.panels.crmLeads} title={c.panels.latestCustomers} action={c.panels.openLeads} />
      <LeadTable c={c} leads={leads} />
    </article>
  );
}

function LeadTable({ c, leads }: { c: typeof copy[Lang]; leads: Lead[] }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>{c.table.customer}</th>
            <th>{c.table.phone}</th>
            <th>{c.table.product}</th>
            <th>{c.table.keyword}</th>
            <th>{c.table.status}</th>
            <th>{c.table.value}</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td data-label={c.table.customer}><strong>{lead.name}</strong><span>{lead.handle}</span></td>
              <td data-label={c.table.phone}>{lead.phone}</td>
              <td data-label={c.table.product}>{lead.product}</td>
              <td data-label={c.table.keyword}><code>{lead.keyword}</code></td>
              <td data-label={c.table.status}><span className="statusPill">{lead.status}</span></td>
              <td data-label={c.table.value}>{lead.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CampaignFlowPanel({ c, campaigns }: { c: typeof copy[Lang]; campaigns: Campaign[] }) {
  return (
    <article className="panel">
      <PanelHead label={c.panels.campaigns} title={c.panels.keywordRoutes} action={c.panels.manage} />
      <div className="campaignStack">
        {campaigns.map((campaign, index) => (
          <div className="campaignCard" key={campaign.name}>
            <div>
              <strong>{campaign.name}</strong>
              <span>{campaign.product}</span>
            </div>
            <code>{campaign.keyword}</code>
            <span className={index < 2 ? "statusPill success" : "statusPill"}>{campaign.status}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function ConversationPanel({ c }: { c: typeof copy[Lang] }) {
  return (
    <article className="panel">
      <PanelHead label={c.panels.conversation} title={c.panels.transcript} action={c.panels.review} />
      <div className="chatStack">
        <div className="chatBubble customer"><span>{c.chat.customer}</span><p>{c.chat.first}</p></div>
        <div className="chatBubble ai"><span>{c.chat.ai}</span><p>{c.chat.second}</p></div>
        <div className="chatBubble customer"><span>{c.chat.customer}</span><p>{c.chat.third}</p></div>
        <div className="chatBubble system"><span>{c.chat.system}</span><p>{c.chat.fourth}</p></div>
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

function LeadsBoard({ c, leads }: { c: typeof copy[Lang]; leads: Lead[] }) {
  return <section className="singleColumn"><LeadsPanel c={c} leads={leads} /></section>;
}

function CampaignsBoard({ c, campaigns }: { c: typeof copy[Lang]; campaigns: Campaign[] }) {
  return <section className="singleColumn"><CampaignFlowPanel c={c} campaigns={campaigns} /></section>;
}

function ProductsBoard({ c }: { c: typeof copy[Lang] }) {
  return (
    <section className="cardsGrid">
      {c.products.map((product, index) => (
        <article className="panel productCard" key={product}>
          <Package size={20} />
          <strong>{product}</strong>
          <span>{c.prices[index]}</span>
          <p>{c.productText}</p>
        </article>
      ))}
    </section>
  );
}

function ConversationsBoard({ c, leads }: { c: typeof copy[Lang]; leads: Lead[] }) {
  return (
    <section className="contentGrid">
      <ConversationPanel c={c} />
      <article className="panel">
        <PanelHead label={c.panels.inbox} title={c.panels.activeConversations} action={c.panels.filter} />
        <div className="campaignStack">
          {leads.map((lead) => (
            <div className="campaignCard" key={lead.id}>
              <div><strong>{lead.name}</strong><span>{lead.summary}</span></div>
              <ChevronRight size={17} />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function IntegrationsBoard({ c }: { c: typeof copy[Lang] }) {
  const icons = [Instagram, Send, Activity, KeyRound];
  return (
    <section className="cardsGrid">
      {c.integrations.map(([title, subtitle], index) => {
        const Icon = icons[index];
        return (
          <article className="panel integrationCard" key={title}>
            <Icon size={22} />
            <strong>{title}</strong>
            <span>{subtitle}</span>
            <button className="ghostButton">{c.configure}</button>
          </article>
        );
      })}
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
