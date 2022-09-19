import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import Layout from "./layout/Layout";
import Report from "./pages/report/Report";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Switch>
            <Layout>
              <Route path="/report/:reportId" component={Report} />
            </Layout>
          </Switch>
        </BrowserRouter>
      </QueryClientProvider>
    </React.Fragment>
  );
}

export default App;