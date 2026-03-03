// ─────────────────────────────────────────────────────────────────────────────
// Detailed content for every node inside the "Internet" section
// ─────────────────────────────────────────────────────────────────────────────

export type ResourceType = 'article' | 'video' | 'interactive' | 'book';

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
}

export interface InternetSubNode {
  id: string;          // matches node id in frontendRoadmapFlow.ts (i1–i6)
  label: string;
  intro: string;
  whatYoullLearn: string[];
  resources: Resource[];
}

export const INTERNET_SECTION = {
  id: 'internet',
  label: 'Internet',
  description:
    'Before writing a single line of frontend code, you need to understand the infrastructure your apps run on. The internet is a global network of networks — learning how data travels, how browsers render pages, and what DNS does will make you a far better developer.',
};

export const INTERNET_SUB_NODES: InternetSubNode[] = [
  {
    id: 'i1',
    label: 'How does the internet work?',
    intro:
      'The internet is a massive global network that allows computers to communicate with each other. Data is broken into small packets, routed across interconnected networks via routers, and reassembled at the destination — all in milliseconds.',
    whatYoullLearn: [
      'How data is split into packets and reassembled',
      'The role of routers and the global backbone',
      'What an IP address is and how it identifies devices',
      'The difference between the internet and the World Wide Web',
      'How physical infrastructure (cables, satellites) connects countries',
    ],
    resources: [
      {
        title: 'How the Internet Works – MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work',
        type: 'article',
      },
      {
        title: 'How the Internet Works in 5 Minutes – YouTube',
        url: 'https://www.youtube.com/watch?v=7_LPdttKXPc',
        type: 'video',
      },
      {
        title: 'CS50 – How the Internet Works',
        url: 'https://www.youtube.com/watch?v=n_KghQP86Sw',
        type: 'video',
      },
      {
        title: 'How the Internet Works – Cloudflare Learning',
        url: 'https://www.cloudflare.com/learning/network-layer/how-does-the-internet-work/',
        type: 'article',
      },
    ],
  },
  {
    id: 'i2',
    label: 'What is HTTP?',
    intro:
      'HTTP (HyperText Transfer Protocol) is the foundation of data communication on the web. Every time you visit a webpage, your browser sends an HTTP request and the server sends back an HTTP response. HTTPS is the encrypted version using TLS.',
    whatYoullLearn: [
      'The request/response cycle between browser and server',
      'HTTP methods: GET, POST, PUT, DELETE, PATCH',
      'HTTP status codes: 200 OK, 301, 404, 500 etc.',
      'HTTP headers and what they communicate',
      'Difference between HTTP/1.1, HTTP/2, and HTTP/3',
      'How HTTPS encrypts traffic using TLS/SSL',
    ],
    resources: [
      {
        title: 'HTTP Overview – MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
        type: 'article',
      },
      {
        title: 'HTTP Crash Course – Traversy Media',
        url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0',
        type: 'video',
      },
      {
        title: 'HTTP/3 Explained – Cloudflare',
        url: 'https://www.cloudflare.com/learning/performance/what-is-http3/',
        type: 'article',
      },
      {
        title: 'HTTP Status Codes Reference',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
        type: 'article',
      },
    ],
  },
  {
    id: 'i3',
    label: 'What is a Domain Name?',
    intro:
      'A domain name is the human-readable address for a website (e.g. google.com). It maps to an underlying IP address via DNS. Domain names are registered through registrars for a yearly fee and structured in a hierarchy of TLDs, domains, and subdomains.',
    whatYoullLearn: [
      'Structure of a domain name: subdomain, domain, TLD',
      'How domain registration and ownership works',
      'What a registrar is (Namecheap, GoDaddy, Google Domains)',
      'How domain names map to IP addresses via DNS records',
      'What WHOIS lookup reveals about a domain',
    ],
    resources: [
      {
        title: 'What is a Domain Name? – MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_domain_name',
        type: 'article',
      },
      {
        title: 'Domain Names Explained – Cloudflare',
        url: 'https://www.cloudflare.com/learning/dns/glossary/what-is-a-domain-name/',
        type: 'article',
      },
      {
        title: 'How Domain Names Work – YouTube',
        url: 'https://www.youtube.com/watch?v=Y4cRx19nhJk',
        type: 'video',
      },
    ],
  },
  {
    id: 'i4',
    label: 'What is Hosting?',
    intro:
      'Web hosting is a service that stores your website files on a server connected to the internet, making them accessible to anyone, anywhere. Choosing the right hosting type (shared, VPS, dedicated, cloud, static) depends on your traffic and budget.',
    whatYoullLearn: [
      'Shared vs VPS vs Dedicated vs Cloud hosting',
      'What static hosting means (Vercel, Netlify, GitHub Pages)',
      'What a web server is (Apache, Nginx)',
      'How your domain connects to your hosting via DNS records (A record)',
      'Concepts of uptime, bandwidth, and CDN',
    ],
    resources: [
      {
        title: 'What is Web Hosting? – MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_web_server',
        type: 'article',
      },
      {
        title: 'Web Hosting Explained – Cloudflare',
        url: 'https://www.cloudflare.com/learning/performance/what-is-web-hosting/',
        type: 'article',
      },
      {
        title: 'Types of Web Hosting – YouTube',
        url: 'https://www.youtube.com/watch?v=Xq_-ROm1zEQ',
        type: 'video',
      },
    ],
  },
  {
    id: 'i5',
    label: 'DNS and how it works?',
    intro:
      'DNS (Domain Name System) is the internet\'s phone book. It translates human-readable domain names like "github.com" into machine-readable IP addresses. DNS lookups happen transparently behind every web request you make.',
    whatYoullLearn: [
      'What DNS records are: A, AAAA, CNAME, MX, TXT',
      'The DNS resolution process: recursive resolver → root → TLD → authoritative',
      'What DNS caching and TTL mean',
      'How to diagnose DNS issues with tools like nslookup / dig',
      'What DNS propagation means when you update records',
    ],
    resources: [
      {
        title: 'DNS Explained – Cloudflare',
        url: 'https://www.cloudflare.com/learning/dns/what-is-dns/',
        type: 'article',
      },
      {
        title: 'DNS Records Explained – video',
        url: 'https://www.youtube.com/watch?v=HnUDtycXSNE',
        type: 'video',
      },
      {
        title: 'What is a DNS A Record? – Cloudflare',
        url: 'https://www.cloudflare.com/learning/dns/dns-records/dns-a-record/',
        type: 'article',
      },
      {
        title: 'How DNS Works – interactive comic',
        url: 'https://howdns.works/',
        type: 'interactive',
      },
    ],
  },
  {
    id: 'i6',
    label: 'Browsers and how they work?',
    intro:
      'The browser is the runtime environment for your frontend code. Understanding how it parses HTML, builds the DOM, applies CSS, runs JavaScript, and paints pixels helps you write faster, bug-free code and understand performance bottlenecks.',
    whatYoullLearn: [
      'The browser rendering pipeline: Parse → Style → Layout → Paint → Composite',
      'What the DOM and CSSOM are',
      'How JavaScript blocks rendering and why async/defer matter',
      'What reflow and repaint are (and why they are expensive)',
      'How browser caching, service workers, and storage APIs work',
      'The difference between the main thread and worker threads',
    ],
    resources: [
      {
        title: 'How Browsers Work – web.dev',
        url: 'https://web.dev/articles/howbrowserswork',
        type: 'article',
      },
      {
        title: 'Browser Rendering Pipeline – Chrome DevRel',
        url: 'https://developers.google.com/web/fundamentals/performance/critical-rendering-path',
        type: 'article',
      },
      {
        title: 'JavaScript Engine & Runtime – Fireship',
        url: 'https://www.youtube.com/watch?v=oc6faXVc54E',
        type: 'video',
      },
      {
        title: 'Inside look at a modern web browser – Google',
        url: 'https://developer.chrome.com/blog/inside-browser-part1/',
        type: 'article',
      },
    ],
  },
];
