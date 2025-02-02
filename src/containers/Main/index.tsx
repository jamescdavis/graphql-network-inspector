import React, { useState, useEffect } from "react";
import SplitPane from "react-split-pane";
import { LayoutMain } from "../../components/Layout";
import { NetworkTable } from "../NetworkTable";
import { NetworkPanel } from "../NetworkPanel";
import { Toolbar } from "../Toolbar";
import {
  useNetworkMonitor,
  NetworkRequest,
} from "../../hooks/useNetworkMonitor";
import { onNavigate } from "../../services/networkMonitor";
import { useKeyPress } from "../../hooks/useKeyPress";

const filterNetworkRequests = (
  networkRequests: NetworkRequest[],
  searchValue: string
) => {
  if (!searchValue) {
    return networkRequests;
  }
  return networkRequests.filter((networkRequest) => {
    const { operationName } = networkRequest.request.primaryOperation;
    return operationName.toLowerCase().includes(searchValue.toLowerCase());
  });
};

export const Main = () => {
  const [networkRequests, clearWebRequests] = useNetworkMonitor();
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null
  );
  const [searchValue, setSearchValue] = useState("");
  const [isPreserveLogs, setIsPreserveLogs] = useState(false);
  const filteredNetworkRequests = filterNetworkRequests(
    networkRequests,
    searchValue
  );
  const selectedRequest = networkRequests.find(
    (request) => request.id === selectedRowId
  );

  useEffect(() => {
    return onNavigate(() => {
      if (!isPreserveLogs) {
        clearWebRequests();
      }
    });
  }, [isPreserveLogs, clearWebRequests]);

  const ToolbarComponent = (
    <Toolbar
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      preserveLogs={isPreserveLogs}
      onPreserveLogsChange={setIsPreserveLogs}
    />
  );

  const NetworkTableComponent = (
    <NetworkTable
      data={filteredNetworkRequests}
      selectedRowId={selectedRowId}
      onRowClick={setSelectedRowId}
      onRowSelect={setSelectedRowId}
      showSingleColumn={Boolean(selectedRequest)}
      onClear={() => {
        setSelectedRowId(null);
        clearWebRequests();
      }}
    />
  );

  if (!selectedRequest) {
    return (
      <LayoutMain header={ToolbarComponent} body={NetworkTableComponent} />
    );
  }

  return (
    <div className="flex flex-col">
      <LayoutMain
        header={ToolbarComponent}
        body={
          <SplitPane split="vertical" minSize={130} defaultSize={210}>
            {NetworkTableComponent}
            <div
              className="dark:bg-gray-900 border-l border-gray-300 dark:border-gray-600 h-full"
              style={{ minWidth: 200 }}
            >
              <NetworkPanel
                data={selectedRequest}
                onClose={() => {
                  setSelectedRowId(null);
                }}
              />
            </div>
          </SplitPane>
        }
      />
    </div>
  );
};
