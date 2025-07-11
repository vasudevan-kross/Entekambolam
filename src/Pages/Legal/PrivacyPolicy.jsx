import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../Data/api";
import logo from "../../assets/a_logo.png";
import { Box, Card, CardContent } from "@mui/material";

const PrivacyPolicy = () => {
  const [policy, setPolicy] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${api}/get_web_page/page/2`)
      .then((response) => {
        setPolicy(response.data.data.body);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching privacy policy:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full h-full">
      <div className="policyHeader">
        <img src={logo} alt="Privacy Icon" className="w-8 h-8" />
        <h1>PRIVACY POLICY</h1>
      </div>
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <Card className="privacyPolicy">
          <CardContent style={{ padding: 0 }}>
            <div
              className="prose text-gray-700"
              dangerouslySetInnerHTML={{ __html: policy }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrivacyPolicy;
