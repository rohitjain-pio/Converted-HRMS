import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, Tab, Typography, Box } from "@mui/material";

export interface TabPanelInternalProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

function TabPanelInternal(props: TabPanelInternalProps) {
  const { children, value, index } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

export interface TabPanelProps {
  tabs: {
    label: string;
    content: React.ReactNode;
    path?: string;
  }[];
}

const TabPanel: React.FC<TabPanelProps> = ({ tabs }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);

  const handleChange = (_e: React.SyntheticEvent, newValue: number) => {
    const data = tabs?.[newValue];

    if (data?.path) {
      const parentPath = location.pathname?.split("/")[1];
      navigate(`/${parentPath}/${data.path}`);
    }

    setValue(newValue);
  };

  useEffect(() => {
    const parentPath = location.pathname?.split("/");
    const tabPath = parentPath?.[parentPath.length - 1];
    const tabIndex = tabs.findIndex(
      ({ path }) => path?.split("?")[0] === tabPath
    );
    setValue(tabIndex === -1 ? 0 : tabIndex);

    return () => {
      setValue(0);
    };
  }, [location]);

  return (
    <div>
      <Tabs value={value} onChange={handleChange}>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} />
        ))}
      </Tabs>
      {tabs.map((tab, index) => (
        <TabPanelInternal key={index} value={value} index={index}>
          {tab.content}
        </TabPanelInternal>
      ))}
    </div>
  );
};

export default TabPanel;
