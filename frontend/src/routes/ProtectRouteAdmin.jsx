import { useState, useEffect } from "react";
import useDusthStore from "../Global Store/DusthStore";
import { currentAdmin } from "../api/auth";
import LoadingtoRedirect from "./LoadingtoRedirect";

const ProtectRouteAdmin = ({ element }) => {
  const [ok, setOk] = useState(false);
  const user = useDusthStore((state) => state.user);
  const token = useDusthStore((state) => state.token);

  useEffect(() => {
    if (user && token) {
      // send to back
      currentAdmin(token)
        .then(() => setOk(true))
        .catch(() => setOk(false));
    }
  }, []);

  return ok ? element : <LoadingtoRedirect />;
};

export default ProtectRouteAdmin;
