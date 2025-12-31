function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState,
  useEffect
} = React;

// 等待所有资源加载完成（已移除 Babel 依赖）
function hideLoader() {
  const loader = document.getElementById('loading-screen');
  if (loader && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
  } else {
    setTimeout(hideLoader, 100);
  }
}

// 页面加载完成后开始检查
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(hideLoader, 100));
} else {
  setTimeout(hideLoader, 100);
}

// --- SVG Icons ---
const Icons = {
  Brain: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"
  })),
  Sparkles: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 9v4"
  })),
  Globe: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "2",
    x2: "22",
    y1: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"
  })),
  Users: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 21v-2a4 4 0 0 0-3-3.87"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3.13a4 4 0 0 1 0 7.75"
  })),
  ArrowRight: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m12 5 7 7-7 7"
  })),
  ChevronDown: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  })),
  Pickaxe: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M14.5 5.5C14 5.5 9 7 9 7s-1.5 5-1.5 5.5S7 11 7 11s5 1.5 5.5 1.5S14 11 14 11s1.5-5 1.5-5.5S15 5 14.5 5.5Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2.9 13c-.5.6-.6 1.4 0 2l7.2 7.2c.6.5 1.4.5 2 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m11 11-1.5 1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m14.5 5.5-8.7 8.7"
  })),
  Shield: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  })),
  Menu: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    x2: "20",
    y1: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    x2: "20",
    y1: "6",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    x2: "20",
    y1: "18",
    y2: "18"
  })),
  X: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  })),
  Sword: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("polyline", {
    points: "14.5 17.5 3 6 3 3 6 3 17.5 14.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "13",
    y1: "19",
    x2: "19",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "16",
    x2: "20",
    y2: "20"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "19",
    y1: "21",
    x2: "21",
    y2: "19"
  })),
  Tent: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M3.5 21 14 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20.5 21 10 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.5 21 12 15l-3.5 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 21h20"
  })),
  Coins: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.09 10.37A6 6 0 1 1 10.34 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 6h1v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m16.71 13.88.7 .71-2.82 2.82"
  })),
  Quill: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M12 19l7-7 3 3-7 7-3-3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 2l7.586 7.586"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "2"
  })),
  ScrollText: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 17V5a2 2 0 0 0-2-2H4"
  })),
  MessageSquare: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
  })),
  Mic: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 10v2a7 7 0 0 1-14 0v-2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "12",
    y1: "19",
    y2: "23"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    x2: "16",
    y1: "23",
    y2: "23"
  })),
  Flag: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    x2: "4",
    y1: "22",
    y2: "15"
  })),
  Map: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("polygon", {
    points: "3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    x2: "9",
    y1: "3",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "15",
    x2: "15",
    y1: "6",
    y2: "21"
  })),
  Palette: p => /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("circle", {
    cx: "13.5",
    cy: "6.5",
    r: ".5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17.5",
    cy: "10.5",
    r: ".5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "7.5",
    r: ".5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6.5",
    cy: "12.5",
    r: ".5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
  }))
};

// --- Logo Component ---
const Logo = ({
  size = "md"
}) => {
  const sizeClasses = size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const fontSize = size === "lg" ? "text-2xl" : "text-xl";
  return /*#__PURE__*/React.createElement("div", {
    className: "relative group cursor-pointer"
  }, /*#__PURE__*/React.createElement("div", {
    className: `${sizeClasses} bg-ink text-paper rounded-sm border border-bronze-500 flex items-center justify-center shadow-md relative z-10`
  }, /*#__PURE__*/React.createElement("span", {
    className: `text-bronze-500 font-serif font-bold ${fontSize}`
  }, "H")));
};

// --- Navbar ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navLinks = ['愿景', '游戏特色', '核心体验', '路线图', '美术风格', '商业&招募'];
  const navIds = ['vision', 'features', 'gameplay', 'roadmap', 'artstyle', 'business'];
  const whitepaperLink = "https://publish.obsidian.md/cooperzheng/03_%E5%B7%A5%E4%BD%9C%E5%8F%B0/25_BraveNewWorld/D_%E6%B8%B8%E6%88%8F%E8%AE%BE%E8%AE%A1/20251202_humAInity%E7%99%BD%E7%9A%AE%E4%B9%A6";
  return /*#__PURE__*/React.createElement("nav", {
    className: `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-paper/95 backdrop-blur-md shadow-md py-3 border-b border-bronze-500/20' : 'bg-transparent py-6'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-6 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 cursor-pointer",
    onClick: () => window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, /*#__PURE__*/React.createElement(Logo, null), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-ink font-serif font-bold tracking-widest text-xl leading-none"
  }, "Hum", /*#__PURE__*/React.createElement("span", {
    className: "text-bronze-700"
  }, "AI"), "nity"))), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:flex items-center gap-6 text-sm font-bold text-stone-600 font-serif tracking-wide"
  }, navLinks.map((item, i) => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: `#${navIds[i]}`,
    className: "hover:text-bronze-700 transition-colors relative group py-2"
  }, item, /*#__PURE__*/React.createElement("span", {
    className: "absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-bronze-700 transition-all duration-300 group-hover:w-full"
  }))), /*#__PURE__*/React.createElement("a", {
    href: whitepaperLink,
    target: "_blank",
    className: "px-4 py-2 bg-ink/90 hover:bg-ink text-paper rounded-sm transition-all shadow-md font-serif text-xs tracking-wider border border-transparent hover:border-bronze-500 flex items-center gap-2 group"
  }, "\u9605\u8BFB\u66F4\u591A\u8BBE\u5B9A\u6587\u6863", /*#__PURE__*/React.createElement(Icons.ArrowRight, {
    className: "w-4 h-4 text-bronze-500 group-hover:translate-x-1 transition-transform"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "md:hidden text-ink",
    onClick: () => setIsOpen(!isOpen)
  }, isOpen ? /*#__PURE__*/React.createElement(Icons.X, null) : /*#__PURE__*/React.createElement(Icons.Menu, null))), /*#__PURE__*/React.createElement("div", {
    className: `md:hidden bg-paper border-b border-bronze-500/20 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col p-6 gap-4 text-stone-700 font-serif"
  }, navLinks.map((item, i) => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: `#${navIds[i]}`,
    onClick: () => setIsOpen(false),
    className: "block py-2 hover:text-bronze-700 border-b border-stone-300/50 last:border-0"
  }, item)), /*#__PURE__*/React.createElement("a", {
    href: whitepaperLink,
    target: "_blank",
    onClick: () => setIsOpen(false),
    className: "mt-2 px-4 py-2 bg-ink/90 hover:bg-ink text-paper rounded-sm transition-all shadow-md font-serif text-sm tracking-wider border border-transparent hover:border-bronze-500 flex items-center justify-center gap-2 group"
  }, "\u9605\u8BFB\u66F4\u591A\u8BBE\u5B9A\u6587\u6863", /*#__PURE__*/React.createElement(Icons.ArrowRight, {
    className: "w-4 h-4 text-bronze-500 group-hover:translate-x-1 transition-transform"
  })))));
};

// --- Hero Section ---
const Hero = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);
  return /*#__PURE__*/React.createElement("section", {
    id: "vision",
    className: "relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-200 pt-16 border-b-4 border-double border-stone-300"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 opacity-20 mix-blend-multiply filter sepia-[.4] contrast-125",
    style: {
      backgroundImage: 'url("https://images.unsplash.com/photo-1475080612764-c0c0f4175904?q=80&w=2074&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/70 to-paper"
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 container mx-auto px-6 text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: `transform transition-all duration-1000 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-block mb-8 animate-float"
  }, /*#__PURE__*/React.createElement("span", {
    className: "py-2 px-6 border-y border-stone-400 text-stone-600 text-xs font-bold font-serif tracking-[0.3em] uppercase"
  }, "200 B.C. - The Reconstruction")), /*#__PURE__*/React.createElement("h1", {
    className: "text-5xl md:text-7xl lg:text-8xl font-serif font-black text-ink mb-8 tracking-tight leading-tight drop-shadow-sm"
  }, "Hum", /*#__PURE__*/React.createElement("span", {
    className: "text-bronze-700 relative inline-block"
  }, "AI"), "nity"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg md:text-xl text-stone-700 max-w-3xl mx-auto mb-12 leading-relaxed font-serif italic border-l-2 border-bronze-500/30 pl-6 md:border-none md:pl-0"
  }, "\u8FD9\u662F\u4E00\u6B3EAI\u539F\u751F\u7684\u6587\u660E\u9886\u8896\u6A21\u62DF\u6E38\u620F\u3002\u4F60\u5C06\u901A\u8FC7\u81EA\u7136\u8BED\u8A00\u6307\u5F15\u62E5\u6709\u72EC\u7ACB\u4EBA\u683C\u7684\u667A\u80FD\u4F53\u4EEC,\u57281:1\u771F\u5B9E\u6BD4\u4F8B\u7684\u5E9F\u571F\u5730\u7403\u4E0A\u91CD\u71C3\u4EBA\u7C7B\u6587\u660E\u7684\u706B\u79CD\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "mt-16 flex flex-col items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "scroll-indicator cursor-pointer",
    onClick: () => document.getElementById('features')?.scrollIntoView({
      behavior: 'smooth'
    })
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-16 border-2 border-bronze-500/60 rounded-full flex items-start justify-center p-2"
  }, /*#__PURE__*/React.createElement(Icons.ChevronDown, {
    className: "w-6 h-6 text-bronze-500/80"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 text-xs text-stone-500 font-serif tracking-wider"
  }, "\u63A2\u7D22\u66F4\u591A")))));
};
const FeatureCard = ({
  icon: Icon,
  title,
  sub,
  desc
}) => /*#__PURE__*/React.createElement("div", {
  className: "p-8 bg-white border border-stone-200 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(139,69,19,0.15)] transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden h-full flex flex-col"
}, /*#__PURE__*/React.createElement("div", {
  className: "absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-stone-200 group-hover:border-bronze-500 transition-colors"
}), /*#__PURE__*/React.createElement("div", {
  className: "absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-stone-200 group-hover:border-bronze-500 transition-colors"
}), /*#__PURE__*/React.createElement("div", {
  className: `w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-stone-50 group-hover:bg-[#F5F0E6] transition-colors shrink-0`
}, /*#__PURE__*/React.createElement(Icon, {
  className: `w-8 h-8 text-stone-600 group-hover:text-bronze-700 transition-colors`
})), /*#__PURE__*/React.createElement("div", {
  className: "mb-4"
}, /*#__PURE__*/React.createElement("h3", {
  className: "text-3xl font-serif font-bold text-ink group-hover:text-bronze-800 transition-colors"
}, title), /*#__PURE__*/React.createElement("span", {
  className: "text-xs uppercase tracking-widest text-stone-400 font-bold"
}, sub)), /*#__PURE__*/React.createElement("p", {
  className: "text-stone-600 leading-relaxed text-lg font-serif flex-grow"
}, desc));
const FeaturesSection = () => {
  return /*#__PURE__*/React.createElement("div", {
    id: "features",
    className: "container mx-auto px-6 py-24 border-b border-stone-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-12"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-bronze-700 font-bold tracking-[0.2em] uppercase text-sm font-serif mb-3 block"
  }, "\u2014 Game Features \u2014"), /*#__PURE__*/React.createElement("h2", {
    className: "text-4xl md:text-5xl font-serif font-bold text-ink"
  }, "\u4E09\u5927\u652F\u67F1")), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-3 gap-8"
  }, /*#__PURE__*/React.createElement(FeatureCard, {
    icon: Icons.Users,
    title: "\u793E\u4F1A\u6D8C\u73B0",
    sub: "\u57FA\u77F3\uFF1A\u5FAE\u7F29\u793E\u4F1A",
    desc: "\u544A\u522B\u201C\u5F00\u56FE-\u94FA\u8DEF-\u5360\u70B9\u201D\u7684\u673A\u68B0\u5FAA\u73AF\u3002\u667A\u80FD\u4F53\u63A2\u9669\u5BB6\u4F1A\u6839\u636E\u6027\u683C\u9009\u62E9\u4E0D\u540C\u7684\u63A2\u7D22\u8DEF\u5F84\uFF1B\u5DE5\u5320\u4F1A\u6839\u636E\u73AF\u5883\u81EA\u53D1\u6539\u826F\u5DE5\u5177\u3002\u4F60\u7684\u51B3\u7B56\u662F\u79CD\u5B50\uFF0C\u800C\u667A\u80FD\u4F53\u6839\u636E\u73AF\u5883\u505A\u51FA\u7684\u96C6\u4F53\u884C\u4E3A\uFF0C\u662F\u6700\u7EC8\u5F00\u51FA\u7684\u82B1\u3002"
  }), /*#__PURE__*/React.createElement(FeatureCard, {
    icon: Icons.Globe,
    title: "\u4EA4\u4E92\u5F0F\u5730\u7403",
    sub: "\u8F7D\u4F53\uFF1A\u7269\u7406\u535A\u5F08",
    desc: "\u8FD9\u4E2A\u661F\u7403\u6709\u5B83\u81EA\u5DF1\u7684\u547C\u5438\u3002\u62DF\u771F\u7684\u56DB\u5B63\u4E0E\u6C34\u6587\u7CFB\u7EDF\uFF0C\u8BA9\u6BCF\u4E00\u9879\u5DE5\u7A0B\u90FD\u5145\u6EE1\u535A\u5F08\u3002\u4FEE\u7B51\u5927\u575D\u53EF\u80FD\u5E26\u6765\u704C\u6E89\u4FBF\u5229\uFF0C\u4E5F\u53EF\u80FD\u5F15\u53D1\u4E0B\u6E38\u5E72\u65F1\u4E0E\u6218\u4E89\u3002\u4F60\u9700\u8981\u50CF\u53E4\u4EE3\u541B\u738B\u4E00\u6837\uFF0C\u5728\u5F81\u670D\u4E0E\u656C\u754F\u4E4B\u95F4\u5BFB\u627E\u5E73\u8861\u3002"
  }), /*#__PURE__*/React.createElement(FeatureCard, {
    icon: Icons.Pickaxe,
    title: "\u6587\u660E\u9645\u4F1A",
    sub: "\u613F\u666F\uFF1A\u5168\u57DF\u540C\u670D",
    desc: "\u8DE8\u8D8A\u5C71\u6D77\u7684\u4F1A\u6664\u3002\u5F53\u4F60\u7387\u9886\u63A2\u9669\u961F\u7FFB\u8D8A\u5B89\u7B2C\u65AF\u5C71\u8109\uFF0C\u7B2C\u4E00\u6B21\u77A5\u89C1\u8FDC\u65B9\u73A9\u5BB6\u4FEE\u7B51\u7684\u957F\u57CE\u65F6\uFF0C\u4F60\u89C1\u8BC1\u7684\u662F\u5730\u7406\u5927\u53D1\u73B0\u7684\u9707\u64BC\u3002\u8FD9\u662F\u7531\u5168\u7403\u73A9\u5BB6\u5171\u540C\u4E66\u5199\u7684\u3001\u4E0D\u53EF\u56DE\u6863\u7684\u5730\u7403\u7F16\u5E74\u53F2\u3002"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-12"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-bronze-700 font-bold tracking-[0.2em] uppercase text-sm font-serif mb-3 block"
  }, "\u2014 Core Experience \u2014"), /*#__PURE__*/React.createElement("h2", {
    className: "text-4xl md:text-5xl font-serif font-bold text-ink"
  }, "\u9886\u8896\u4F53\u9A8C")), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-3 gap-8"
  }, /*#__PURE__*/React.createElement(FeatureCard, {
    icon: Icons.Mic,
    title: "\u6C9F\u901A\u9A71\u52A8",
    sub: "\u8BED\u8A00\u5373\u6743\u529B",
    desc: "\u573A\u666F\u5316\u6C9F\u901A\u3002\u5728\u6218\u524D\u53D1\u8868\u6177\u6168\u6FC0\u6602\u7684\u6F14\u8BF4\u9F13\u821E\u58EB\u6C14\uFF1B\u5728\u8BAE\u4F1A\u4E2D\u8010\u5FC3\u8046\u542C\u5404\u65B9\u8BC9\u6C42\u8FBE\u6210\u5171\u8BC6\uFF1B\u5728\u6DF1\u591C\u4E0E\u8FF7\u832B\u7684\u667A\u8005\u4FC3\u819D\u957F\u8C08\u3002\u8BED\u8A00\u662F\u4F60\u552F\u4E00\u7684\u6743\u6756\uFF0C\u4F60\u7684\u58F0\u97F3\u5C06\u5851\u9020\u6587\u660E\u7684\u7075\u9B42\u3002"
  }), /*#__PURE__*/React.createElement(FeatureCard, {
    icon: Icons.Sparkles,
    title: "\u542F\u8FEA\u6587\u660E",
    sub: "\u70B9\u71C3\u706B\u79CD",
    desc: "\u4F60\u4E0D\u662F\u586B\u9E2D\u5F0F\u7684\u6559\u5B98\uFF0C\u800C\u662F\u6587\u660E\u7684\u5148\u77E5\u3002\u4F60\u629B\u51FA\u201C\u706B\u4E0E\u9ECF\u571F\u201D\u7684\u6A21\u7CCA\u731C\u60F3\uFF0C\u806A\u660E\u7684\u5DE5\u5320\u53EF\u80FD\u4F1A\u610F\u5916\u53D1\u660E\u9676\u5668\u3002\u540C\u6837\u7684\u542F\u793A\u5728\u4E0D\u540C\u73AF\u5883\u4E0B\uFF0C\u4F1A\u6D8C\u73B0\u51FA\u622A\u7136\u4E0D\u540C\u7684\u79D1\u6280\u6811\u5206\u652F\u3002"
  }), /*#__PURE__*/React.createElement(FeatureCard, {
    icon: Icons.Map,
    title: "\u7EC4\u7EC7\u6F14\u5316",
    sub: "\u8BBE\u8BA1\u7CFB\u7EDF",
    desc: "\u4ECE\u4EB2\u529B\u4EB2\u4E3A\u5230\u77E5\u4EBA\u5584\u4EFB\u3002\u968F\u7740\u805A\u843D\u58EE\u5927\uFF0C\u4F60\u9700\u8981\u9009\u62D4\u6838\u5FC3\u56E2\u961F\uFF0C\u5C06\u610F\u5FD7\u5C42\u5C42\u4F20\u8FBE\u3002\u662F\u552F\u624D\u662F\u4E3E\u8D70\u5411\u7CBE\u82F1\u5171\u548C\uFF0C\u8FD8\u662F\u552F\u5FE0\u662F\u4E3E\u6F14\u5316\u4E3A\u519B\u4E8B\u72EC\u88C1\uFF1F\u4F60\u7684\u7528\u4EBA\u6807\u51C6\u51B3\u5B9A\u4E86\u6587\u660E\u7684\u653F\u6CBB\u5E95\u8272\u3002"
  }))));
};

// --- Comparison Section (Updated with Whitepaper V3.0 Scenarios) ---
const ComparisonSection = () => {
  const [activeScene, setActiveScene] = useState('domestic');
  const scenarios = {
    domestic: [{
      id: 1,
      speaker: "me",
      name: "我",
      text: "冬天快到了，我们需要更暖和的房子。",
      thoughts: []
    }, {
      id: 2,
      speaker: "agent",
      name: "工匠",
      text: "领袖，我们可以造‘空调’吗？我听说那是让空气流动的神物。",
      thoughts: [{
        type: 'logos',
        label: '⚖️ Logos 校验',
        content: '时代锁: [电力未解锁] -> 触发创造性降级'
      }]
    }, {
      id: 3,
      speaker: "agent",
      name: "工匠",
      text: "（挠头）虽然不懂什么是电，但我们可以尝试在窗户挂上浸湿的草帘，风一吹就很凉快！",
      thoughts: [{
        type: 'agent',
        label: '💡 涌现结果',
        content: '基于现有认知 (水+风) 发明 [水帘降温]'
      }]
    }, {
      id: 4,
      speaker: "me",
      name: "我",
      text: "非常有创意的想法！就按这个方案执行，记得多备些水。",
      thoughts: []
    }],
    expedition: [{
      id: 1,
      speaker: "me",
      name: "我",
      text: "子锋，带人埋伏在峡谷两侧高地。少游，去谷底设饵，诱敌深入！",
      thoughts: []
    }, {
      id: 2,
      speaker: "agent",
      name: "少游",
      text: "（发抖）那...那是变异野猪...它的獠牙太可怕了，我...我动不了...",
      thoughts: [{
        type: 'agent',
        label: '⚡ 智能体心理',
        content: '性格: [胆小] -> 状态: [僵直]'
      }]
    }, {
      id: 3,
      speaker: "me",
      name: "我",
      text: "少游别慌！往左侧岩石跑！相信我！子锋，投掷标枪掩护他！",
      thoughts: [{
        type: 'mythos',
        label: '🔥 Mythos 叙事',
        content: '关键时刻 -> 领袖介入'
      }]
    }, {
      id: 4,
      speaker: "agent",
      name: "少游",
      text: "（咬牙狂奔）啊啊啊！拼了！",
      thoughts: [{
        type: 'agent',
        label: '✨ 角色成长',
        content: '克服恐惧 -> 获得特性 [战场老兵]'
      }]
    }]
  };
  return /*#__PURE__*/React.createElement("section", {
    id: "gameplay",
    className: "py-24 bg-paper relative border-b border-stone-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-20"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-bronze-700 font-bold tracking-widest uppercase text-xs font-serif mb-3 block"
  }, "\u2014 The Shift \u2014"), /*#__PURE__*/React.createElement("h2", {
    className: "text-4xl md:text-5xl font-serif font-bold text-ink mb-6"
  }, "\u73A9\u6CD5\u5207\u7247\uFF1A\u610F\u56FE\u4EA4\u4E92"), /*#__PURE__*/React.createElement("p", {
    className: "text-stone-500 font-serif italic max-w-xl mx-auto"
  }, "\u4ECE\u201C\u673A\u68B0\u6307\u4EE4\u201D\u5230\u201C\u613F\u666F\u6C9F\u901A\u201D\u7684\u4F53\u9A8C\u65AD\u5C42\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-0 items-stretch max-w-5xl mx-auto border-4 border-double border-stone-300 bg-stone-100 shadow-2xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-10 bg-[#E8E4D9] shadow-inner relative border-r border-stone-300 flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-6 right-6 px-3 py-1 bg-stone-300 text-stone-600 text-xs font-bold uppercase tracking-wide font-serif"
  }, "Old Ways"), /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl font-serif font-bold text-stone-700 mb-8"
  }, "\u673A\u68B0\u6307\u4EE4"), /*#__PURE__*/React.createElement("div", {
    className: "bg-stone-300/50 p-4 rounded border border-stone-400/30 font-serif text-xs text-stone-600 space-y-3 flex-1 grayscale"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between border-b border-stone-400/20 pb-2 mb-2"
  }, /*#__PURE__*/React.createElement("span", null, "TASK_PANEL"), /*#__PURE__*/React.createElement("span", null, "[-] [x]")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#F2EEE5] p-2 border border-stone-400 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "[\u5EFA\u9020] \u7A7A\u8C03\u8BBE\u65BD"), /*#__PURE__*/React.createElement("span", {
    className: "text-red-500"
  }, "Error: \u79D1\u6280\u672A\u89E3\u9501")), /*#__PURE__*/React.createElement("div", {
    className: "bg-[#F2EEE5] p-2 border border-stone-400 flex items-center justify-between opacity-60"
  }, /*#__PURE__*/React.createElement("span", null, "[\u6218\u6597] \u5F3A\u5236\u653B\u51FB"), /*#__PURE__*/React.createElement("span", null, "(\u5355\u4F4D\u65E0\u54CD\u5E94)")))), /*#__PURE__*/React.createElement("p", {
    className: "mt-6 text-stone-400 text-sm font-serif italic text-center"
  }, "\"\u51B7\u6F20\u7684\u6570\u503C\u7BA1\u7406\u8005\uFF0C\u5931\u53BB\u4E86\u4E0E\u9C9C\u6D3B\u4E2A\u4F53\u4E92\u52A8\u7684\u6E29\u5EA6\u3002\"")), /*#__PURE__*/React.createElement("div", {
    className: "p-10 bg-white relative flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bronze-500 to-bronze-700"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute top-6 right-6 px-3 py-1 bg-bronze-100 text-bronze-800 text-xs font-bold uppercase tracking-wide font-serif"
  }, "New Era"), /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl font-serif font-bold text-ink mb-6"
  }, "\u613F\u666F\u9886\u8896"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mb-6 font-serif"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveScene('domestic'),
    className: `px-4 py-2 text-xs font-bold border-2 transition-all duration-300 whitespace-nowrap text-center flex-shrink-0 ${activeScene === 'domestic' ? 'bg-[#8C6B3D] text-white border-[#8C6B3D] shadow-md' : 'bg-white text-[#2B2B2B] border-[#B08D55] hover:bg-[#F2EEE5]'}`,
    style: {
      minWidth: '150px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "block"
  }, "\u5185\u653F\uFF1A\u521B\u9020\u6027\u8BEF\u8BFB")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveScene('expedition'),
    className: `px-4 py-2 text-xs font-bold border-2 transition-all duration-300 whitespace-nowrap text-center flex-shrink-0 ${activeScene === 'expedition' ? 'bg-[#8C6B3D] text-white border-[#8C6B3D] shadow-md' : 'bg-white text-[#2B2B2B] border-[#B08D55] hover:bg-[#F2EEE5]'}`,
    style: {
      minWidth: '150px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "block"
  }, "\u5916\u51FA\uFF1A\u56F4\u730E\u5371\u673A"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-6 flex-1 overflow-y-auto pr-2 max-h-[400px] no-scrollbar font-serif relative"
  }, scenarios[activeScene].map(line => /*#__PURE__*/React.createElement("div", {
    key: line.id,
    className: "group animate-float",
    style: {
      animationDuration: '4s',
      animationDelay: `${line.id * 0.5}s`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `flex gap-3 ${line.speaker === 'agent' ? 'flex-row-reverse' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: `w-8 h-8 rounded border flex items-center justify-center font-serif text-xs shrink-0 font-bold ${line.speaker === 'me' ? 'border-stone-300 bg-stone-100 text-stone-800' : 'border-[#B08D55] bg-[#F9F5F0] text-[#8C6B3D]'}`
  }, line.name), /*#__PURE__*/React.createElement("div", {
    className: `relative max-w-[80%] p-3 text-sm border shadow-sm transition-all duration-500 ${line.speaker === 'me' ? 'bg-stone-50 text-stone-800 border-stone-200 italic rounded-tr-lg rounded-bl-lg rounded-br-lg' : 'bg-[#F9F5F0] text-[#2B2B2B] border-[#B08D55] rounded-tl-lg rounded-bl-lg rounded-br-lg'}`
  }, line.text)), line.thoughts.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: `mt-2 flex flex-col gap-1 ${line.speaker === 'agent' ? 'items-end pr-11' : 'items-start pl-11'}`
  }, line.thoughts.map((thought, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: `text-[10px] px-2 py-1 rounded border shadow-sm ${thought.type === 'mythos' ? 'bg-terracotta/10 text-terracotta border-terracotta/30' : thought.type === 'logos' ? 'bg-stone-200 text-stone-600 border-stone-300' : 'bg-[#F2EEE5] text-[#8C6B3D] border-[#B08D55]'}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold mr-1"
  }, thought.label, ":"), thought.content))))))))));
};

// --- Core Loop (Updated Steps) ---
const CoreLoop = () => {
  const steps = [{
    id: 1,
    title: "提出愿景",
    sub: "Propose Vision",
    icon: "🗣️",
    desc: "[发声] 你站在篝火旁，面对满怀期待的族人，用自然语言描绘你的目标——“冬天快到了，我们需要更暖和的房子”。"
  }, {
    id: 2,
    title: "边界划定",
    sub: "Define Boundaries",
    icon: "⚖️",
    desc: "[校验] 中控 AI 像一位严厉的物理导师。如果你在石器时代下令“造空调”，它会基于现有认知进行“创造性降级”，而非直接报错。"
  }, {
    id: 3,
    title: "群策群力",
    sub: "Refinement",
    icon: "📜",
    desc: "[碰撞] 激进的猎人提议用兽皮，保守的长老坚持用泥土。他们根据性格提出方案，在你面前争论，等待你的裁决。"
  }, {
    id: 4,
    title: "自主执行",
    sub: "Execution",
    icon: "⚡",
    desc: "[放权] 告别保姆式微操。方案一旦敲定，智能体自动分工。你只需站在山顶俯瞰，看着你的蓝图在众人的忙碌中变为现实。"
  }, {
    id: 5,
    title: "文明沉淀",
    sub: "Evolution",
    icon: "🌱",
    desc: "[回响] 你的每一次抉择（尚武或探索），都在通过无数个体的模仿与传承，如水滴石穿般塑造着这个文明的集体潜意识。"
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "core-loop",
    className: "py-20 pb-48 bg-[#EFE9DE] border-b border-stone-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-16"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl md:text-4xl font-serif font-bold text-ink mb-4"
  }, "\u73A9\u5BB6\u4F53\u9A8C\u5FAA\u73AF"), /*#__PURE__*/React.createElement("div", {
    className: "w-20 h-1 bg-bronze-500 mx-auto mb-3"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-stone-500 font-serif italic"
  }, "\u9F20\u6807\u60AC\u505C\u4E94\u4E2A\u9636\u6BB5\u67E5\u770B\u5177\u4F53\u884C\u4E3A")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap justify-center gap-4 md:gap-6"
  }, steps.map((step, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "flex items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative group w-44 md:w-56 p-2 text-center hover:-translate-y-2 transition-transform duration-300 cursor-default"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-24 h-24 mx-auto bg-white border-2 border-stone-300 rounded-full flex items-center justify-center text-5xl mb-5 shadow-sm group-hover:border-bronze-500 group-hover:shadow-md transition-all relative z-20 icon-hint-pulse",
    style: {
      animationDelay: `${i * 0.4}s`
    }
  }, step.icon), /*#__PURE__*/React.createElement("h4", {
    className: "font-serif font-bold text-2xl text-stone-800 mb-1"
  }, step.title), /*#__PURE__*/React.createElement("span", {
    className: "text-xs uppercase tracking-wider text-stone-500 font-serif block mb-2"
  }, step.sub), /*#__PURE__*/React.createElement("div", {
    className: "opacity-0 group-hover:opacity-100 transition-all duration-300 absolute left-1/2 -translate-x-1/2 top-[100%] w-72 bg-white p-5 border border-stone-200 rounded shadow-xl z-50 pointer-events-none"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-lg text-stone-600 leading-relaxed font-serif text-left"
  }, step.desc))), i < steps.length - 1 && /*#__PURE__*/React.createElement("div", {
    className: "hidden md:block w-6 md:w-10 h-0.5 bg-stone-300/50 mt-[-90px]"
  }))))));
};

// --- Dual Core System (Refined Definitions) ---
const DualCoreSystem = () => {
  return /*#__PURE__*/React.createElement("section", {
    id: "dual-core",
    className: "py-24 bg-[#1A1816] relative overflow-hidden border-t-4 border-bronze-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 opacity-5",
    style: {
      backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-scales.png")'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto px-6 relative z-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-center md:text-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-2xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-bronze-500 font-bold tracking-[0.2em] uppercase text-sm font-serif"
  }, "The Gemini Core"), /*#__PURE__*/React.createElement("h2", {
    className: "text-4xl md:text-6xl font-serif font-bold text-stone-100 mt-4"
  }, "\u53CC\u5B50\u4E2D\u67A2"), /*#__PURE__*/React.createElement("p", {
    className: "text-stone-400 mt-6 text-lg font-serif italic"
  }, "\u89E3\u51B3\u751F\u6210\u5F0F AI \u7684\u4E0D\u53EF\u63A7\u96BE\u9898\uFF1A\u592A\u806A\u660E\u4F1A\u51FA\u620F\uFF0C\u592A\u611A\u7B28\u4F1A\u65E0\u804A\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:block w-32 h-1 bg-stone-700"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-2 gap-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-stone-800/50 border border-stone-600 p-10 relative overflow-hidden group hover:bg-stone-800 transition-colors"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-0 right-0 p-10 opacity-5 text-stone-500"
  }, /*#__PURE__*/React.createElement(Icons.Brain, {
    size: 120,
    strokeWidth: 0.5
  })), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4 mb-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 bg-stone-700 text-stone-300 border border-stone-500"
  }, /*#__PURE__*/React.createElement(Icons.Brain, {
    className: "w-8 h-8"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "text-3xl font-serif font-bold text-stone-200"
  }, "Logos ", /*#__PURE__*/React.createElement("span", {
    className: "text-base font-normal text-stone-400 ml-2 italic"
  }, "\u7406\u6027\u4E2D\u67A2"))), /*#__PURE__*/React.createElement("p", {
    className: "text-xl text-stone-300 font-serif italic mb-6"
  }, "\"\u7269\u7406\u4E16\u754C\u7684\u5B88\u95E8\u4EBA\""), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("li", {
    className: "flex gap-4 items-start"
  }, /*#__PURE__*/React.createElement(Icons.Shield, {
    className: "w-6 h-6 text-stone-400 shrink-0 mt-1"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-stone-200 block font-serif mb-1"
  }, "\u6C89\u6D78\u611F\u9632\u706B\u5899"), /*#__PURE__*/React.createElement("span", {
    className: "text-stone-400 text-sm font-serif"
  }, "\u62E6\u622A\u201C\u77F3\u5668\u65F6\u4EE3\u9020\u6838\u5F39\u201D\u7684\u5E7B\u89C9\u6307\u4EE4\uFF0C\u7EF4\u62A4\u4E16\u754C\u7684\u903B\u8F91\u81EA\u6D3D\u3002"))), /*#__PURE__*/React.createElement("li", {
    className: "flex gap-4 items-start"
  }, /*#__PURE__*/React.createElement(Icons.Quill, {
    className: "w-6 h-6 text-stone-400 shrink-0 mt-1"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-stone-200 block font-serif mb-1"
  }, "\u613F\u666F\u7FFB\u8BD1"), /*#__PURE__*/React.createElement("span", {
    className: "text-stone-400 text-sm font-serif"
  }, "\u5C06\u201C\u5EFA\u7ACB\u9632\u5FA1\u201D\u8FD9\u6837\u6A21\u7CCA\u7684\u610F\u56FE\uFF0C\u81EA\u52A8\u7FFB\u8BD1\u4E3A\u201C\u5229\u7528\u788E\u77F3\u5806\u780C\u80F8\u5899\u201D\u7684\u5177\u4F53\u884C\u52A8\u65B9\u6848\u3002")))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-br from-[#2A1A10] to-[#1A100C] border border-bronze-900/50 p-10 relative overflow-hidden group hover:border-bronze-700 transition-colors"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-0 right-0 p-10 opacity-10 text-bronze-500"
  }, /*#__PURE__*/React.createElement(Icons.Sparkles, {
    size: 120,
    strokeWidth: 0.5
  })), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4 mb-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 bg-[#2A1A10]/60 text-[#B08D55] border border-[#5C4033]"
  }, /*#__PURE__*/React.createElement(Icons.Sparkles, {
    className: "w-8 h-8"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "text-3xl font-serif font-bold text-[#F2EEE5]"
  }, "Mythos ", /*#__PURE__*/React.createElement("span", {
    className: "text-base font-normal text-[#B08D55] ml-2 italic"
  }, "\u53D9\u4E8B\u4E2D\u67A2"))), /*#__PURE__*/React.createElement("p", {
    className: "text-xl text-[#E6DCC9] font-serif italic mb-6"
  }, "\"\u620F\u5267\u8282\u594F\u7684\u5BFC\u6F14\""), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("li", {
    className: "flex gap-4 items-start"
  }, /*#__PURE__*/React.createElement(Icons.ScrollText, {
    className: "w-6 h-6 text-[#B08D55] shrink-0 mt-1"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-[#E6DCC9] block font-serif mb-1"
  }, "\u8282\u594F\u63A7\u5236\u5668"), /*#__PURE__*/React.createElement("span", {
    className: "text-[#B08D55] opacity-90 text-sm font-serif"
  }, "\u6D88\u706D\u5783\u573E\u65F6\u95F4\u3002\u5728\u6587\u660E\u5E73\u6DE1\u65F6\u5236\u9020\u793E\u4F1A\u8BAE\u9898\uFF0C\u5728\u7EDD\u5883\u65F6\u7ED9\u4E88\u5E0C\u671B\u3002"))), /*#__PURE__*/React.createElement("li", {
    className: "flex gap-4 items-start"
  }, /*#__PURE__*/React.createElement(Icons.MessageSquare, {
    className: "w-6 h-6 text-[#B08D55] shrink-0 mt-1"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-[#E6DCC9] block font-serif mb-1"
  }, "\u7075\u611F\u690D\u5165"), /*#__PURE__*/React.createElement("span", {
    className: "text-[#B08D55] opacity-90 text-sm font-serif"
  }, "\u5F53\u73A9\u5BB6\u8FF7\u832B\u65F6\uFF0C\u501F\u667A\u80FD\u4F53\u4E4B\u53E3\u8BF4\u51FA\uFF1A\u201C\u9886\u8896\uFF0C\u6211\u770B\u8FD9\u6CB3\u6C34\u6D41\u5F97\u6025\uFF0C\u662F\u4E0D\u662F\u80FD\u5229\u7528\u4E00\u4E0B\uFF1F\u201D")))))))));
};

// --- Roadmap (Updated with Validation Goals) ---
const Roadmap = () => {
  const steps = [{
    phase: "Phase I",
    time: "3 Months",
    title: "部落的脉动 (MVP)",
    desc: "验证“最小社会闭环”。不仅是让AI听懂人话，更是验证玩家能否仅凭自然语言，率领智能体完成一次有组织的集体狩猎。"
  }, {
    phase: "Phase II",
    time: "+ 3 Months",
    title: "铁器时代 (垂直切片)",
    desc: "验证\"复杂分工与涌现\"。锁定铁器时代，观察不同性格的智能体能否自发形成高效的合作网络（如铁匠优先造武器，农夫自动囤粮）。"
  }, {
    phase: "Phase III",
    time: "+ 6 Months",
    title: "文明重燃 (Steam EA)",
    desc: "验证“历史的跨越感”。玩家能否感受到亲手推动一个蒙昧部落走向启蒙的史诗感？验证智能体思维方式随时代演进而发生的质变。"
  }, {
    phase: "Phase IV",
    time: "+ 12 Months",
    title: "文明共存 (Multiplayer)",
    desc: "验证“多元互动的社会图谱”。探索军事文明与商业文明的竞合关系——是战争，还是形成“雇佣兵换取商品”的共生生态？"
  }, {
    phase: "Phase V",
    time: "Long Term",
    title: "真实地球 (Ultimate Vision)",
    desc: "验证“共同书写的地球编年史”。全球同服，不可回档。数万智能体同时运算，重演人类历史的数字化社会实验。"
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "roadmap",
    className: "py-24 bg-paper border-b border-stone-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-20"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl md:text-4xl font-serif font-bold text-ink mb-4"
  }, "\u7814\u53D1\u89C4\u5212"), /*#__PURE__*/React.createElement("div", {
    className: "w-24 h-1 bg-bronze-600 mx-auto"
  })), /*#__PURE__*/React.createElement("div", {
    className: "relative max-w-4xl mx-auto space-y-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute left-[15px] md:left-1/2 top-0 bottom-0 w-px bg-stone-300 md:-translate-x-1/2"
  }), steps.map((step, index) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: index
  }, /*#__PURE__*/React.createElement("div", {
    className: `relative flex flex-col md:flex-row items-start md:items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute left-[11px] md:left-1/2 top-1 md:top-1/2 w-2 h-2 rounded-full bg-stone-100 border-2 border-stone-400 z-10 md:-translate-x-1/2 md:-translate-y-1/2 shadow-[0_0_0_4px_#F2EEE5]"
  }, index === 0 && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-bronze-600 rounded-full animate-ping opacity-75"
  }), index === 0 && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-bronze-600 rounded-full"
  })), /*#__PURE__*/React.createElement("div", {
    className: `ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-2 md:justify-end",
    style: {
      justifyContent: index % 2 === 0 ? 'flex-start' : undefined
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: `text-base font-bold tracking-widest uppercase ${index === 0 ? 'text-bronze-600' : 'text-stone-400'}`
  }, step.phase), /*#__PURE__*/React.createElement("span", {
    className: "text-sm bg-stone-200 px-2 py-0.5 rounded text-stone-600 font-serif"
  }, step.time)), /*#__PURE__*/React.createElement("h3", {
    className: `text-3xl font-serif font-bold mb-3 ${index === 0 ? 'text-ink' : 'text-stone-700'}`
  }, step.title), /*#__PURE__*/React.createElement("p", {
    className: "text-lg text-stone-600 leading-relaxed font-serif"
  }, step.desc))), index === 2 && /*#__PURE__*/React.createElement("div", {
    className: "relative py-16"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-terracotta/30"
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-8"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bg-paper px-6 py-2 text-base font-bold text-terracotta border border-terracotta/20 rounded-full shadow-sm font-serif inline-block"
  }, "--- \u8BAD\u7EC3\u8425\u76EE\u6807\u5206\u5272\u7EBF (1 Year) ---")), /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto bg-gradient-to-br from-stone-50 to-stone-100 border-l-4 border-terracotta/40 rounded-r-lg shadow-md p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-shrink-0 w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icons.Flag, {
    className: "w-6 h-6 text-terracotta"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-xl font-serif font-bold text-ink mb-3"
  }, "\u8BAD\u7EC3\u8425\u91CC\u7A0B\u7891"), /*#__PURE__*/React.createElement("p", {
    className: "text-stone-700 leading-relaxed font-serif text-base mb-4"
  }, "\u5728\u6B64\u8282\u70B9\uFF0C\u6211\u4EEC\u5C06\u5B8C\u6210\u6838\u5FC3\u73A9\u6CD5\u7684\u95ED\u73AF\u9A8C\u8BC1\u4E0E\u5355\u673A\u4EA7\u54C1\u7684 Early Access \u53D1\u5E03\uFF0C\u8FBE\u6210\u8BAD\u7EC3\u8425\u7684\u7ED3\u9879\u8981\u6C42\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "border-t border-stone-300 pt-4 mt-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-stone-600 leading-relaxed font-serif text-sm"
  }, /*#__PURE__*/React.createElement("strong", {
    className: "text-ink"
  }, "\u5F53\u524D\u7248\u672C\uFF1A"), "\u6B64\u7248\u672C\u7F8E\u672F\u98CE\u683C\u4E3A\u7C7B\u6587\u660E\u7684\u4FEF\u89C6\u89D2\u98CE\u683C\u5316\u5199\u5B9E\u3002", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", {
    className: "text-ink"
  }, "\u540E\u7EED\u89C4\u5212\uFF1A"), "\u4F1A\u6301\u7EED\u66F4\u65B0\uFF0C\u6269\u5C55\u6587\u660E\u65F6\u4EE3\u3001\u5730\u56FE\u533A\u57DF\u3002"))))))))))));
};

// --- Art Style Section ---
const ArtStyleSection = () => {
  return /*#__PURE__*/React.createElement("section", {
    id: "artstyle",
    className: "py-24 bg-[#EBE6DB] border-b border-stone-200 relative overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto px-6 relative z-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-20"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-4xl md:text-5xl font-serif font-bold text-ink mb-4 flex items-center justify-center gap-4"
  }, /*#__PURE__*/React.createElement(Icons.Palette, {
    className: "text-bronze-700 w-10 h-10"
  }), " \u6E38\u620F\u7F8E\u672F\u98CE\u683C"), /*#__PURE__*/React.createElement("div", {
    className: "w-24 h-1 bg-bronze-500 mx-auto mb-8"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-stone-600 font-serif italic max-w-2xl mx-auto"
  }, "\u4F5C\u4E3AAI\u539F\u751F\u6E38\u620F\u7684\u63A2\u7D22\uFF0C\u56E2\u961F\u4F1A\u9009\u62E9\u7A33\u59A5\u7684\u4FEF\u89C6\u89D2\u7C7B\u6587\u660E\u7684\u7F8E\u672F\u98CE\u683C\u6765\u4FDD\u8BC1\u53EF\u843D\u5730\u3002\u968F\u7740AI\u6280\u672F\u8FDB\u6B65\uFF0C\u4EE5\u53CA\u56E2\u961F\u62E5\u6709\u66F4\u591A\u8D44\u6E90\u548C\u673A\u4F1A\uFF0C\u5E0C\u671B\u5728\u672A\u6765\u80FD\u591F\u63A8\u51FA\u9AD8\u54C1\u8D28\u7684\u62DF\u771F\u5199\u5B9E+\u7B2C\u4E09\u4EBA\u79F0\u7248\u672C\u7684humAInity")), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-stretch"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-4 shadow-lg border border-stone-200 group hover:-translate-y-1 transition-transform duration-500"
  }, /*#__PURE__*/React.createElement("div", {
    className: "aspect-video bg-stone-200 overflow-hidden relative mb-6 border border-stone-100"
  }, /*#__PURE__*/React.createElement("img", {
    src: "https://i2.hdslb.com/bfs/article/watermark/2e0c984a36f0fa2a41a500a8ce23e4d59fc1bb99.png@1192w.avif",
    alt: "Top-down Stylized View",
    className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute top-4 left-4 bg-bronze-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-sm"
  }, "Bootcamp / EA Phase")), /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl font-serif font-bold text-ink mb-3"
  }, "\u4FEF\u89C6\u89D2 \xB7 \u98CE\u683C\u5316\u5199\u5B9E ", /*#__PURE__*/React.createElement("span", {
    className: "text-base font-normal text-stone-500"
  }, "(\u5F53\u524D\u9009\u62E9)")), /*#__PURE__*/React.createElement("p", {
    className: "text-stone-600 leading-relaxed font-serif"
  }, "\u7C7B\u300A\u6587\u660E\u300B\u7CFB\u5217\u7684\u4FEF\u89C6\u89D2\u7CBE\u81F4\u6C99\u76D8\u3002\u8BA9\u73A9\u5BB6\u4E00\u773C\u770B\u6E05\u6570\u767E\u4E2A\u667A\u80FD\u4F53\u7684\u884C\u4E3A\u903B\u8F91\uFF0C\u786E\u4FDD\u6A21\u62DF\u7ECF\u8425\u7684\u6E05\u6670\u5EA6\u4E0E\u6613\u8BFB\u6027\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-4 shadow-lg border border-stone-200 group hover:-translate-y-1 transition-transform duration-500"
  }, /*#__PURE__*/React.createElement("div", {
    className: "aspect-video bg-stone-200 overflow-hidden relative mb-6 border border-stone-100"
  }, /*#__PURE__*/React.createElement("img", {
    src: "https://i.imgur.com/4X5zAas.png",
    alt: "3D Immersive Realistic View",
    className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute top-4 left-4 bg-ink text-white text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-sm"
  }, "Ultimate Vision")), /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl font-serif font-bold text-ink mb-3"
  }, "\u5168\u62DF\u771F \xB7 3D \u6C89\u6D78\u4E16\u754C ", /*#__PURE__*/React.createElement("span", {
    className: "text-base font-normal text-stone-500"
  }, "(\u672A\u6765\u613F\u666F)")), /*#__PURE__*/React.createElement("p", {
    className: "text-stone-600 leading-relaxed font-serif"
  }, "\u6253\u7834\u89C6\u89D2\u7684\u9650\u5236\uFF0C\u8FDB\u5316\u4E3A\u5168\u62DF\u771F\u7684 3D \u4E16\u754C\u3002\u73A9\u5BB6\u5C06\u80FD\u4EE5\u7B2C\u4E00\u4EBA\u79F0\u6F2B\u6B65\u5728\u81EA\u5DF1\u4EB2\u624B\u7F14\u9020\u7684\u6587\u660E\u4E2D\uFF0C\u611F\u53D7\u5E15\u7279\u519C\u795E\u5E99\u5927\u7406\u77F3\u7684\u51B0\u51C9\u4E0E\u7231\u7434\u6D77\u98CE\u7684\u54B8\u6E7F\u3002")))));
};

// --- Business & Team (Updated with New Strategy) ---
const BusinessAndTeam = () => {
  return /*#__PURE__*/React.createElement("section", {
    id: "business",
    className: "py-24 bg-stone-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-16"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-4xl md:text-5xl font-serif font-bold text-ink mb-10 flex items-center gap-4"
  }, /*#__PURE__*/React.createElement(Icons.Coins, {
    className: "text-bronze-600 w-10 h-10"
  }), " \u5546\u4E1A\u5316\u6A21\u5F0F"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-8 font-serif"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-8 border-l-4 border-bronze-600 shadow-sm"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-2xl text-stone-800 mb-3"
  }, "\u4E70\u65AD\u5236\u4F18\u5148 (Buy-to-Play)"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg text-stone-600 leading-relaxed"
  }, "\u575A\u6301\u201C\u4E00\u6B21\u4ED8\u8D39\uFF0C\u7EC8\u8EAB\u7545\u73A9\u201D\u3002\u7EDD\u4E0D\u51FA\u552E\u6570\u503C\u9053\u5177(Pay-to-Win)\uFF0C\u786E\u4FDD\u201C\u7B56\u7565\u4E0E\u9886\u5BFC\u529B\u201D\u662F\u552F\u4E00\u7684\u83B7\u80DC\u8981\u7D20\uFF0C\u5EFA\u7ACB\u73A9\u5BB6\u4FE1\u4EFB\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-8 border-l-4 border-bronze-500 shadow-sm"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-2xl text-stone-800 mb-3"
  }, "\u6587\u660E\u7075\u9B42\u7684\u62D3\u7247 (Memetic Packs)"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg text-stone-600 leading-relaxed mb-4"
  }, "\u51FA\u552E\u7684\u662F\u201C\u6587\u660E\u53C2\u6570\u96C6\u201D\uFF0C\u800C\u975E\u76AE\u80A4\u3002"), /*#__PURE__*/React.createElement("ul", {
    className: "list-disc pl-5 space-y-2 text-stone-600"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "\u82CF\u683C\u62C9\u5E95/\u970D\u53BB\u75C5"), "\uFF1A\u62E5\u6709\u5386\u53F2\u4EBA\u7269\u51B3\u7B56\u903B\u8F91\u7684\u82F1\u96C4\u667A\u80FD\u4F53\u3002"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "\u5B9A\u5236\u5316\u53CC\u6838\u53C2\u6570"), "\uFF1A\u5982\u201C\u5143\u8001\u9662\u201D\u7684\u793E\u4F1A\u67B6\u6784\u6216\u201C\u738B\u671D\u53F2\u8BD7\u201D\u7684\u53D9\u4E8B\u98CE\u683C\u3002"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "\u6C89\u6D78\u5F0F\u7F8E\u5B66"), "\uFF1A\u5EFA\u7B51\u3001\u5668\u7269\u4E0E\u670D\u9970\u7684\u751F\u6210\u89C4\u5219\uFF0C\u91CD\u73B0\u5386\u53F2\u7684\u201C\u5728\u573A\u611F\u201D\u3002"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-8 border-l-4 border-stone-500 shadow-sm"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-2xl text-stone-800 mb-3"
  }, "\u7AEF\u4E91\u6DF7\u5408\u67B6\u6784 (Hybrid AI)"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg text-stone-600 leading-relaxed"
  }, "\u89E3\u51B3 Success Tax\u3002\u5229\u7528 ", /*#__PURE__*/React.createElement("strong", null, "HumAInity-Lite-7B"), " \u7AEF\u4FA7\u5C0F\u6A21\u578B\u5904\u7406 90% \u7684\u65E5\u5E38\u4EA4\u4E92\uFF08\u5982\u5BF9\u8BDD\u3001\u884C\u4E3A\u5224\u5B9A\uFF09\uFF0C\u5B9E\u73B0\u96F6\u5EF6\u8FDF\u4E0E\u4F4E\u8FB9\u9645\u6210\u672C\u3002")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-4xl md:text-5xl font-serif font-bold text-ink mb-10 flex items-center gap-4"
  }, /*#__PURE__*/React.createElement(Icons.Tent, {
    className: "text-bronze-600 w-10 h-10"
  }), " \u62DB\u52DF\uFF1AAI\u539F\u751F\u56E2\u961F"), /*#__PURE__*/React.createElement("p", {
    className: "text-stone-600 mb-8 italic font-serif text-xl"
  }, "\"1 \u7B56\u5212 + 2 \u7A0B\u5E8F + 2 \u7F8E\u672F\u3002\u6BCF\u4E2A\u4EBA\u90FD\u662F\u6307\u6325\u5B98\u3002\""), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-6"
  }, [{
    role: "游戏策划",
    desc: "项目灵魂，Prompt 调优与规则设计"
  }, {
    role: "AI核心工程师",
    desc: "构建大脑 (LLM Workflow / RAG)"
  }, {
    role: "玩法工程师",
    desc: "构建世界 (Unity/PCG 物理交互)"
  }, {
    role: "技术美术",
    desc: "构建管线 (AIGC 生成流)"
  }, {
    role: "美术风格负责人",
    desc: "构建外观 (审美与 UI 交互)"
  }].map((job, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "bg-stone-200/50 p-6 border border-stone-300 hover:border-bronze-500 transition-colors"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-stone-800 text-lg font-serif mb-3"
  }, job.role), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-stone-500 font-serif leading-relaxed"
  }, job.desc))))))));
};
const Footer = () => {
  return /*#__PURE__*/React.createElement("footer", {
    className: "bg-stone-900 text-stone-400 py-16 border-t-4 border-bronze-800"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row justify-between items-start gap-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-6"
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "lg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-stone-200 font-serif font-bold tracking-wider text-2xl"
  }, "Hum", /*#__PURE__*/React.createElement("span", {
    className: "text-bronze-600"
  }, "AI"), "nity"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] uppercase tracking-widest text-stone-600"
  }, "Project Genesis"))), /*#__PURE__*/React.createElement("p", {
    className: "text-stone-500 text-sm leading-relaxed mb-6 font-serif"
  }, "\u4F60\u7684\u529B\u91CF\u6765\u81EA\u5F71\u54CD\u529B\uFF0C\u800C\u975E\u64CD\u63A7\u529B\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-12 text-sm font-sans"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-stone-200 font-bold mb-4 uppercase tracking-wider text-xs"
  }, "Explore"), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "hover:text-bronze-500 transition-colors"
  }, "\u767D\u76AE\u4E66")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "hover:text-bronze-500 transition-colors"
  }, "\u5F00\u53D1\u65E5\u5FD7")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-stone-200 font-bold mb-4 uppercase tracking-wider text-xs"
  }, "Connect"), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "hover:text-bronze-500 transition-colors"
  }, "Discord")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "hover:text-bronze-500 transition-colors"
  }, "Email Us")))))), /*#__PURE__*/React.createElement("div", {
    className: "mt-16 pt-8 border-t border-stone-800 text-center text-xs text-stone-600 font-serif"
  }, "\xA9 2025 HumAInity Project.")));
};
const App = () => {
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen bg-paper"
  }, /*#__PURE__*/React.createElement(Navbar, null), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(FeaturesSection, null), /*#__PURE__*/React.createElement(ComparisonSection, null), /*#__PURE__*/React.createElement(CoreLoop, null), /*#__PURE__*/React.createElement(DualCoreSystem, null), /*#__PURE__*/React.createElement(Roadmap, null), /*#__PURE__*/React.createElement(ArtStyleSection, null), /*#__PURE__*/React.createElement(BusinessAndTeam, null), /*#__PURE__*/React.createElement(Footer, null));
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));
