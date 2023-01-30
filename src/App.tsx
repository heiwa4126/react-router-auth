import * as React from "react";
import { Routes, Route, Link, useNavigate, useLocation, Navigate, Outlet } from "react-router-dom";
import { fakeAuthProvider } from "./auth";

export default function App() {
  return (
    <AuthProvider>
      <h1>Auth Example</h1>
      <p>
        この例では、公開ページ、保護ページ、ログインページの3つのページで構成されるシンプルなログインフローを示しています。保護されたページを見るためには、まずログインする必要があります。かなり標準的なものです。
      </p>
      <p>
        まず、公開ページにアクセスします。次に、保護されたページにアクセスします。まだログインしていないので、ログインページにリダイレクトされます。ログインした後、保護されたページにリダイレクトされます。
      </p>
      <p>
        毎回URLが変わっていることに注目してください。この時点で戻るボタンをクリックすると、ログインページに戻ると思いますか？
        いいえ、そうではありません。あなたはすでにログインしているのです。試しに、ログインする直前に訪れたページ、つまり公開ページに戻っているのがわかると思います。
      </p>

      <Routes>
        <Route element={<Layout />}>
          <Route index element={<PublicPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route
            path="protected/1"
            element={
              <RequireAuth>
                <ProtectedPage />
              </RequireAuth>
            }
          />
          <Route
            path="protected/2"
            element={
              <RequireAuth>
                <ProtectedPage2 />
              </RequireAuth>
            }
          />
          <Route path="test">
            <Route
              path="1"
              element={
                <RequireAuth>
                  <ProtectedPage />
                </RequireAuth>
              }
            />
            <Route
              path="2"
              element={
                <RequireAuth>
                  <ProtectedPage2 />
                </RequireAuth>
              }
            />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

function Layout() {
  return (
    <div>
      <AuthStatus />
      <ul>
        <li>
          <Link to="/">Public Page</Link>
        </li>
        <li>
          <Link to="/protected/1">Protected Page1</Link> | <Link to="/protected/2">Page 2</Link>
        </li>
        <li>
          <Link to="/test/1">Test Page1</Link> | <Link to="/test/2">Page 2</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}

interface AuthContextType {
  user: any;
  signin: (user: string, callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: React.ReactNode }) {
  let [user, setUser] = React.useState<any>(null);

  let signin = (newUser: string, callback: VoidFunction) => {
    return fakeAuthProvider.signin(() => {
      setUser(newUser);
      callback();
    });
  };

  let signout = (callback: VoidFunction) => {
    return fakeAuthProvider.signout(() => {
      setUser(null);
      callback();
    });
  };

  let value = { user, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return React.useContext(AuthContext);
}

function AuthStatus() {
  let auth = useAuth();
  let navigate = useNavigate();

  if (!auth.user) {
    return <p>You are not logged in.</p>;
  }

  return (
    <p>
      Welcome {auth.user}!{" "}
      <button
        onClick={() => {
          auth.signout(() => navigate("/"));
        }}
      >
        Sign out
      </button>
    </p>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function LoginPage() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();

  let from = location.state?.from?.pathname || "/";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let username = formData.get("username") as string;

    auth.signin(username, () => {
      // ログインページにリダイレクトされた際に閲覧しようとしたページに戻させる
      // ログインページにリダイレクトされたときに訪問しようとしたページに送り返します。
      // { replace: true } を使用して、ログインページの履歴スタックに別のエントリを作成しないようにします。
      // ログインページの履歴スタックに別のエントリを作成しないようにします。 これは、次のことを意味します。
      // 保護されたページが表示され、戻るボタンをクリックしたときに
      // ログインページに戻ってくることはありません。
      // ユーザーエクスペリエンスにとって非常に良いことです。

      navigate(from, { replace: true });
    });
  }

  return (
    <div>
      <p>You must log in to view the page at {from}</p>

      <form onSubmit={handleSubmit}>
        <label>
          Username: <input name="username" type="text" />
        </label>{" "}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function PublicPage() {
  return <h3>Public</h3>;
}

function ProtectedPage() {
  return (
    <>
      <h3>Protected</h3>
      <p>
        Innovare conatus est, non mollis pertinacia sensus. Dux virtus percipit, mentis fortitudo resistit. Ideoque
        invenire necesse est, ut aperiam perspicuitatem.
      </p>
    </>
  );
}
function ProtectedPage2() {
  return (
    <>
      <h3>Protected 2</h3>
      <p>
        Innovation ist der Versuch, nicht schwache Durchhaltevermögen. Der Führer versteht Tugend, der Mut des Geistes
        widersteht. Daher muss man Klarheit finden.
      </p>
    </>
  );
}
