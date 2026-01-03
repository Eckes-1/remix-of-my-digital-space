import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "首页" },
    { path: "/blog", label: "文章" },
    { path: "/about", label: "关于" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="blog-container">
        <nav className="flex items-center justify-between h-16">
          <Link to="/" className="font-serif text-xl font-semibold text-foreground hover:text-primary transition-colors">
            墨迹随笔
          </Link>
          
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`text-sm font-medium transition-colors link-underline ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
