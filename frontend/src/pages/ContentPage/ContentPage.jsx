import { useEffect, useState } from "react";

import styles from "./ContentPage.module.scss";

import Panel from "@/components/Panel/Panel";
import Card from "@/components/Card/Card";
import InputContainer from "@/components/InputContainer/InputContainer";
import TextInput from "@/components/TextInput/TextInput";
import Button from "@/components/Button/Button";

import {
  FaDisplay,
  FaLink,
} from "react-icons/fa6";

import { useContent, useContentActions } from "@/context/ContentContext";

export default function ContentPage () {
  const [ newContentName, setNewContentName ] = useState("");
  const [ newContentURL, setNewContentURL ] = useState("");

  const [ contentNameHasError, setContentNameHasError ] = useState(false);
  const [ contentURLHasError, setContentURLHasError ] = useState(false);

  const [ addButtonIsLocked, setAddButtonIsLocked ] = useState(false);

  
  const { 
    data: content,
    loading: contentLoading,
  } = useContent();

  const { 
    addContent, 
    removeContent,
    modifyContent,
  } = useContentActions();

  // TODO:

  // Implementation Tasks:
  // =====================
  // - Use contentLoading to gate content list with loading component
  // - Build content list from actual content data
  // - Use ContentActions for action handlers
  // - Add delete button to delete existing contente
  // - Think of UI presentation for modifying content (use inputs, edit in place?)

  // TODO: Might not need this 
  // useEffect(() => {
  //   if (!contentLoading) 
  // }, [contentLoading]);

  useEffect(() => {
    console.log("[ContentPage::useEffect] 'content' is: ", content);
  }, [content]);

  const handleAddContentClick = async () => {
    let hasError = false;

    if (!newContentName || newContentName.trim() === "") {
      setContentNameHasError(true);
      hasError = true;
    }

    if (!newContentURL || newContentURL.trim() === "") {
      setContentURLHasError(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setAddButtonIsLocked(true);

    const newContent = {
      name: newContentName.trim(),
      url: newContentURL.trim(),
    };

    try {
      await addContent(newContent);
    }
    catch (error) {
      console.error("[ContentPage::handlAddContentClick] Error adding content: ", error);
      setAddButtonIsLocked(false);
      return;
    }
    
    
    // TODO: Maybe don't remove these yet
    // 
    setAddButtonIsLocked(false);
    setContentNameHasError(false);
    setContentURLHasError(false);
    setNewContentName("");
    setNewContentURL("");



    // setCurrentContent([...currentContent, newContent]);
  };

  return (
    <Panel maxHeight>
      <h1>Content Management</h1>
      <Card>
        <InputContainer noTopPadding>
          <TextInput 
            error={contentNameHasError}
            label={"Name"}
            value={newContentName}
            setValue={setNewContentName}
          />
        </InputContainer>

        <InputContainer noBorder>
          <TextInput 
            error={contentURLHasError}
            label={"URL"}
            value={newContentURL}
            setValue={setNewContentURL}
          />
        </InputContainer>

        <InputContainer noBottomPadding >
          <Button
            icon="add"
            label={"Add Content"}
            locked={addButtonIsLocked}
            loading={addButtonIsLocked}
            onClick={handleAddContentClick}
            smallText
          />
        </InputContainer>
      </Card>

      <Card scrollOverflow grow>
        {/* {
          // TODO: include edge cases (no content added, currentContent is null)
          currentContent && currentContent.map((content) => (
            <ContentItem
              content={content}
            />
          ))
        } */}

        {/* TODO: Test this code branch */}

        {
          contentLoading ? (
            <>
              {/* TODO: Use loading component */}
              Loading...
            </>
          ) : (
            <>
              {
                content.map((item) => (
                  <ContentItem
                    content={item}
                  />
                ))
              }
            </>
          )
        }
      </Card>
    </Panel>
  );
}

function ContentItem ({ 
  content,
  handleDeleteClick = () => {},
}) {
  const { name, url, screens } = content;

  console.log("[ContentPage::ContentItem] received content: ", content);
  console.log("[ContentPage::ContentItem] name: ", name);
  console.log("[ContentPage::ContentItem] url: ", url);
  console.log("[ContentPage::ContentItem] screens: ", screens);

  // return;

  return (
    <div className={styles["content-item"]}>
      <h1 className={styles["content-item-name"]}>{name}</h1>
      
      <div className={styles["content-item-url"]}>
        <span className={styles["content-url-label"]}><FaLink />&nbsp;:</span>
        <span className={styles["content-url"]}>
          <a href={url} target="_blank">{url}</a>
        </span>
      </div>

      <div className={styles["content-item-screens"]}>
        <span className={styles["content-screens-label"]}><FaDisplay />&nbsp;:</span>
        {
          screens && screens.length > 0 ? screens.map((screen, index) => (
            <span
              className={styles["content-item-screen-name"]}
              key={`content-item-screen-${index}`}
            >
              {screen.name}
            </span>
          )) : (
            <span className={styles["content-screens-none"]}>Not used</span>
          )
        }
      </div>

      <div className={styles["content-item-controls"]}>
        {/* TODO: theme and use trash icon */}
        <Button
          icon={"remove"}
          label="Delete"
          noLabel
          onClick={handleDeleteClick}
        />
      </div> 
    </div>
  )
}