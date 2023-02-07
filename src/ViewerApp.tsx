import { Authentication, Device, Fleet } from "@formant/data-sdk";
import { TelemetryUniverseData } from "@formant/universe-connector";
import { IUniverseData } from "@formant/universe-core";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { buildScene } from "./buildScene";
import { Viewer3DConfiguration } from "./config";
import { Universe } from "./layers/common/Universe";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { FormantColors } from "./layers/utils/FormantColors";

let LoginContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${FormantColors.silver};
  font-family: "Inter", sans-serif;
`;

let BottomRightContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

const Button = styled.button``;

const TextArea = styled.textarea`
  width: 500px;
  height: 200px;
`;

export function ViewerApp() {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [configuration, setConfiguration] = useState<Viewer3DConfiguration>({
    devices: [
      {
        name: "My Device",
        mapLayers: [
          {
            mapName: "Ground",
            mapType: "Ground Plane",
          },
        ],
      },
    ],
  });
  const [universeData, setUniverseData] = useState<IUniverseData | undefined>(
    undefined
  );
  const [checkingToken, setCheckingToken] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentDevice, setCurrentDevice] = useState<string | undefined>(
    undefined
  );
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const afterLogin = async () => {
    const devices = await Fleet.getOnlineDevices();
    setDevices(devices);
    const device = localStorage.getItem("device");
    if (device) {
      setCurrentDevice(device);
    }
    const storedConfig = localStorage.getItem("configuration");
    if (storedConfig) {
      setConfiguration(storedConfig ? JSON.parse(storedConfig) : {});
    }
    setUniverseData(new TelemetryUniverseData());
    setLoggedIn(true);
  };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await Authentication.loginWithToken(token);
          await afterLogin();
        } catch (e) {
          setError("Bad token, maybe it expired? try logging in again");
        }
      }
      setCheckingToken(false);
    })();
  }, []);

  if (checkingToken) return <> </>;

  if (loggedIn) {
    if (currentDevice && universeData) {
      return (
        <>
          <UniverseDataContext.Provider value={universeData}>
            <Universe>
              <ambientLight />
              {buildScene(configuration, currentDevice)};
            </Universe>
          </UniverseDataContext.Provider>
          {isConfiguring && (
            <LoginContainer>
              <TextArea ref={textAreaRef}></TextArea>
              <Button
                onClick={() => {
                  if (textAreaRef.current) {
                    setConfiguration(JSON.parse(textAreaRef.current.value));
                    localStorage.setItem(
                      "configuration",
                      textAreaRef.current.value
                    );
                    setIsConfiguring(false);
                  }
                }}
              >
                Done
              </Button>
            </LoginContainer>
          )}
          <BottomRightContainer>
            <Button
              onClick={() => {
                window.setTimeout(() => {
                  if (textAreaRef.current) {
                    textAreaRef.current.value = JSON.stringify(
                      configuration,
                      null,
                      2
                    );
                  }
                }, 10);
                setIsConfiguring(true);
              }}
            >
              Configure
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("device");
                window.location.reload();
              }}
            >
              Signout
            </Button>
          </BottomRightContainer>
        </>
      );
    } else {
      return (
        <LoginContainer>
          {devices.map((d) => (
            <Button
              key={d.id}
              onClick={() => {
                localStorage.setItem("device", d.id);
                setCurrentDevice(d.id);
              }}
            >
              {d.name}
            </Button>
          ))}
        </LoginContainer>
      );
    }
  }

  return (
    <div>
      <LoginContainer>
        <h1>Login</h1>
        <div>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          onClick={async () => {
            try {
              const a = await Authentication.login(username, password);
              localStorage.setItem("token", (a as any).accessToken);
              await afterLogin();
            } catch (e) {
              setError(JSON.stringify(e, Object.getOwnPropertyNames(e)));
            }
            setCheckingToken(false);
          }}
        >
          Login
        </Button>
        <div>{error}</div>
      </LoginContainer>
    </div>
  );
}
