import { 
  createContext, 
  use,
  useEffect, 
  useReducer,
} from "react";

import { BACKEND_BASE_URL } from "@/constants";

const CONTENT_ROUTE = `${BACKEND_BASE_URL}/api/content`;

const DEFAULT = {
  data: [],
};

function loadContent() {
  return { ...DEFAULT, loading: true };
}

function reducer(state, action) {
  switch(action.type) {
    case "set":
      // return {...state, [action.key]: action.value };
      return {...state, data: action.data };
    case "add": 
      return {...state, data: [...state.data, action.item] };
    case "remove":
      return {...state, data: state.data.filter((content) => content.id !== action.id) };
    case "modify":
      return {...state, data: state.data.map((content) => 
        content.id !== action.item.id ? content : { ...content, ...action.item }
      )};
    case "hydrate":
      return {...state, data: [...action.data], loading: false };
    default:
      throw new Error(`[ContentContext::reducer] Unknown action: ${action.type}`);
  }
}

const ContentContext = createContext(null);
const ContentActionContext = createContext(null);

export function ContentProvider({ children }) {
  const [ content, dispatch ] = useReducer(reducer, undefined, loadContent);

  useEffect(() => {
    fetch(CONTENT_ROUTE)
      .then(res => res.json())
      .then(data => dispatch({ type: "hydrate", data }))
      .catch(err => console.error("[ContentContext::useEffect] Failed to load content data:", err));
  }, []);

  const addContent = (newContent) => {
    return fetch(CONTENT_ROUTE, {
      method: "POST",
      body: JSON.stringify(newContent),
      headers: { "Content-Type": "application/json" },
    })
      .then(async res => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            `[ContentContext::addContent] ${data.message ?? `Request failed with status ${res.status}`}`
          );
        }

        return data;
      })
      .then(data => dispatch({ type: "add", item: data }));
  };

  const removeContent = (id) => {
    return fetch(`${CONTENT_ROUTE}/${id}`, {
      method: "DELETE",
    })
      .then(async res => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            `[ContentContext::removeContent] ${data.message ?? `Request failed with status ${res.status}`}`
          );
        }

        return data;
      })
      .then(() => dispatch({ type: "remove", id }));
  };

  const modifyContent = (id, partial) => {
    return fetch(`${CONTENT_ROUTE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(partial),
      headers: { "Content-Type": "application/json" },
    })
      .then(async res => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            `[ContentContext::modifyContent] ${data.message ?? `Request failed with status ${res.status}`}`
          );
        }

        return data;
      })
      .then(data => dispatch({ type: "modify", item: data }));
  };

  return (
    <ContentContext value={content}>
      <ContentActionContext value={{addContent, removeContent, modifyContent}}>
        {children}
      </ContentActionContext>
    </ContentContext>
  )
}

export const useContent = () => use(ContentContext);
export const useContentActions = () => use(ContentActionContext);
