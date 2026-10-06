import { useEffect, useState } from "react";

import styles from "./ContentPage.module.scss";

import Panel from "@/components/Panel/Panel";
import Card from "@/components/Card/Card";
import InputContainer from "@/components/InputContainer/InputContainer";
import TextInput from "@/components/TextInput/TextInput";
import Button from "@/components/Button/Button";
import DropdownMenu from "@/components/DropdownMenu/DropdownMenu";
import CheckBox from "@/components/CheckBox/CheckBox";
import ToggleSlider from "@/components/ToggleSlider/ToggleSlider";

import {
  FaDisplay,
  FaLink,
} from "react-icons/fa6";

import { useContent, useContentActions } from "@/context/ContentContext";

const TEST_CONTENT = [
  {
    name: "Example Content 1",
    url: "https://google.com",
    screens: ["Test Screen 1", "Test Screen 2"],
  },
  {
    name: "Example Content 2",
    url: "https://google.com",
    screens: ["Test Screen 1",],
  },
  {
    name: "Example Content 3",
    url: "https://google.com",
    screens: ["Test Screen 2", "Test Screen 3"],
  },
];


export default function ContentPage () {
  const [ newContentName, setNewContentName ] = useState("");
  const [ newContentURL, setNewContentURL ] = useState("");
  const [ currentContent, setCurrentContent ] = useState(TEST_CONTENT);

  const [ contentNameHasError, setContentNameHasError ] = useState(false);
  const [ contentURLHasError, setContentURLHasError ] = useState(false);

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

  const handleAddContentClick = () => {
    let hasError = false;

    if (!newContentName || newContentName === "") {
      setContentNameHasError(true);
      hasError = true;
    }

    if (!newContentURL || newContentURL === "") {
      setContentURLHasError(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setContentNameHasError(false);
    setContentURLHasError(false);
    setNewContentName("");
    setNewContentURL("");

    const newContent = {
      name: newContentName,
      url: newContentURL,
      screens: [],
    };

    setCurrentContent([...currentContent, newContent]);
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
            content.map((item) => (
              <ContentItem
                content={item}
              />
            ))
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

  return (
    <div className={styles["content-item"]}>
      <h1 className={styles["content-item-name"]}>{name}</h1>
      
      <div className={styles["content-item-url"]}>
        <span className={styles["content-url-label"]}><FaLink />&nbsp;:</span>
        <span className={styles["content-url"]}>
          <a href={url}>{url}</a>
        </span>
      </div>

      <div className={styles["content-item-screens"]}>
        <span className={styles["content-screens-label"]}><FaDisplay />&nbsp;:</span>
        {
          screens && screens.length > 0 ? screens.map((name, index) => (
            <span
              className={styles["content-item-screen-name"]}
              key={`content-item-screen-${index}`}
            >
              {name}
            </span>
          )) : (
            <span className={styles["content-screens-none"]}>None</span>
          )
        }
      </div>

      <div className={styles["content-item-controls"]}>
        {/* TODO: theme and use trash icon */}
        <Button
          label="Delete"
          onClick={handleDeleteClick}
        />
      </div>
    </div>
  )
}