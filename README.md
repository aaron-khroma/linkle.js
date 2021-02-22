# Linkle
A WIP homebrew Discord bot currently intended for personal experimentation and usage. Eventually intended to provide hyperlink-related utilities. Uses MongoDB for data storage purposes.

### FEATURES:
**Echo** - Linkle loves it when you say her name, and she'll respond if you do. If you're lucky she might even respond with a sparkle.

**Stonks** - If you send a message that contains a $ followed by a stock ticker, Linkle will look it up for you on AlphaVantage. (regex must match `/(?<=^|\s)(\\$[A-Za-z\\.\\-]{1,16})/`)

### UPCOMING:
**Relinkle** - Linkle's primary function will be to implement a post voting system for the server's meme group. Anything posted as an image or link there will be tracked by Linkle, and she will dutifully record the number of upvotes and downvotes given to each. If you ask, she will be able to tell you interesting stats about the links posted recently, as well as the activity of the people that posted them.

**Querystrip** - In an effort to combat corporate data harvesting, Linkle will also strip posted links of any tracking data queries before relinkling them. CTRL+C CTRL+V without fear, Linkle's got it!
