import { Link } from "react-router-dom";

const LoginWidget = () => {
  return (
    <div className="widget-card animate-fade-in">
      <p className="text-sm text-muted-foreground text-center mb-4">
        Use Sholok Web more safely and conveniently
      </p>

      <Link to="/login" className="login-button mb-4">
        <span className="w-6 h-6 rounded bg-primary-foreground flex items-center justify-center text-primary font-bold text-sm">
          S
        </span>
        <span className="text-primary-foreground font-semibold">Sholok Web</span>
        <span className="text-primary-foreground/90">log in</span>
      </Link>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <button className="hover:text-foreground transition-colors">
          Find ID
        </button>
        <span>|</span>
        <button className="hover:text-foreground transition-colors">
          find password
        </button>
        <span>|</span>
        <button className="hover:text-foreground transition-colors">
          join the membership
        </button>
      </div>
    </div>
  );
};

export default LoginWidget;
