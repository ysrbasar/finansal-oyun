import { navigate } from "../lib/router";
import { MascotSays } from "../components/Mascot";

export function NotFound() {
  return (
    <div className="py-10">
      <MascotSays mood="vay">Bu sayfayı haritada bulamadım! Hadi ana sayfaya dönelim.</MascotSays>
      <button className="btn-primary mt-6 w-full" onClick={() => navigate("/", { replace: true })}>
        Ana sayfaya dön
      </button>
    </div>
  );
}
