<%*
let fileName = await tp.system.prompt("Enter your Achievement:");

// Define your prefix
let prefix = "🌟 - ";
 
if (fileName) {
    let fullFileName = prefix + fileName;
    await tp.file.rename(fullFileName);
} else {
    new Notice("No file name provided, keeping the default name.");
}

const dateAdded = tp.date.now('YYYY-MM-DD');
const week = tp.date.now("gggg-[W]ww");
const quarter = `Q${tp.date.now("Q")} - ${tp.date.now("YYYY")}`;
const month = tp.date.now("MMMM YYYY");
const year = tp.date.now("YYYY");

const metaData = `---
tags:
  - "#My/Achievement"
  - "#🌟"
cssclasses:
aliases:
Date-Added: "[[${dateAdded}]]"
Week: "[[${week}]]"
Quarter: "[[${quarter}]]"
Month: "[[${month}]]"
Year: "[[${year}]]"
Summary: 
What-Worked: 
---`;

tR += metaData;
const view = app.workspace.activeLeaf.getViewState()
view.state.mode = 'source'
view.state.source = false
app.workspace.activeLeaf.setViewState(view)
%>

>[!info]- Meta Details
> Date: [[<% tp.date.now("DD-MM-YY") %>]]
> Week: [[<% tp.date.now("gggg-[W]ww") %>]]
> Month: [[<% tp.date.now("MMMM YYYY") %>]]
> Quarter: [[Q<% tp.date.now("Q") %> - <% tp.date.now("YYYY") %>]]
> Year: [[<% tp.date.now("YYYY") %>]]

`BUTTON[cycle]` `BUTTON[achievements]` 

```meta-bind-embed
[[Metabind Cycles and Review Menu]]
```

## Achievement Summary
`INPUT[textArea:Summary]` 

---

### What Worked?
`INPUT[textArea:What-Worked]` 