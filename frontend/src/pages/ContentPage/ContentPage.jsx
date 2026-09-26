import { useState } from "react";

import styles from "./ContentPage.module.scss";

import Panel from "@/components/Panel/Panel";
import Card from "@/components/Card/Card";
import InputContainer from "@/components/InputContainer/InputContainer";
import TextInput from "@/components/TextInput/TextInput";
import Button from "@/components/Button/Button";
import DropdownMenu from "@/components/DropdownMenu/DropdownMenu";
import CheckBox from "@/components/CheckBox/CheckBox";
import ToggleSlider from "@/components/ToggleSlider/ToggleSlider";

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

  return (
    <Panel>
      <h1>Content Page</h1>
      <p>
        I'm going to use this panel to test the UI components.
      </p>
      <Card>
        <h2>Add Content</h2>
        <InputContainer>
          <TextInput 
            label={"Name"}
            value={newContentName}
            setValue={setNewContentName}
          />
        </InputContainer>

        <InputContainer>
          <TextInput 
            label={"URL"}
            value={newContentURL}
            setValue={setNewContentURL}
          />
        </InputContainer>

        <InputContainer>
          <Button
            label={"Add Content"}
          />
        </InputContainer>
      </Card>

      <Card>
        <h2>Content</h2>
        {
          // TODO: include edge cases (no content added, currentContent is null)
          currentContent && currentContent.map((content) => (
            <ContentItem
              content={content}
            />
          ))
        }
      </Card>
    </Panel>
  );
}

function ContentItem ({ content }) {
  const { name, url, screens } = content;

  return (
    <div className={styles["content-item"]}>
      <h1 className={styles["content-item-name"]}>{name}</h1>
      
      <div className={styles["content-item-url"]}>
        <span className={styles["content-url-label"]}>URL: </span>
        <span className={styles["content-url"]}>
          <a href={url}>{url}</a>
        </span>
      </div>

      <div className={styles["content-item-screens"]}>
        <span className={styles["content-screens-label"]}>Used by: </span>
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
    </div>
  )
}