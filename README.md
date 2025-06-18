## Task

Your task is to go through the routes provided, identify any issues, and fix them. You should also add any additional features you think are necessary. Adding tests is a plus.

The files in src/data are the mocked out data stores that the API uses. These are the only files which SHOULD NOT be modified. Feel free to read through their code to get an idea of what they are doing if needed.

Feel free to add any dependencies you think are necessary.

If there are improvements you'd like to make that are to time consuming, add a comment in the code explaining what you would do. Add any other recommendations or potential future improvements in the README.

## Additional Task

If you have time, create a new endpoint similar to `/top-user-stats`, which would power a new page showing the top 50 users.

## Getting Started

1. Clone this repository
2. Run `npm install`
3. Run `npm start`
4. The API will be running on `http://localhost:3001`

## Submission

Once you are happy with your changes, push them to a new github repo and send us the link.

## Recommendations

Add your recommendations here:

- need better validation for query params like limit & offset, I have omitted this in some places --- could use express-validator for this
- also have not yet checked timestamps in tests for created messages --- need to add check that validates that they are within a short period of the validation
- I have also created an API to create user (I mistakingly thought that would be required)
- I have not cleaned up ressource (like new messages I created) using beforeEach / afterEach hooks in the tests, I have instead used different test user names to avoid interference
- returned objects are not consistent yet, I would adopt a convention like:
  - every return message should contain:
    ```
        {
            "status": "ok", // for success responses
            "message": ", // in case of errors
            "[messages|stats|...]": [...]. // to contain arrays of items
        }
    ```

## Notes

Assumptions:

- I have written the tests against the mock data (meaning for example I assume user admin already exists, etc ...)

- regarding `src/data`:

  - the sorting logic seems to be reversed. I would expect to `sort: "asc"` and get the oldest message first (smaller timestamp). Not sure if this has been done on purpose. Fix should be in the `data/database` file, which I was told not to touch.

  ```
    const [firstMessage] = await req.db.getMessages({
       user,
       offset: 0,
       limit: 1,
       sort: "desc",
   });
  ```

  The fixed sorting order should be (we switch the `-1` for `1`):

  ```
  messageList.sort(
    (a, b) =>
      (a.date.getTime() - b.date.getTime()) * (sort === "asc" ? 1 : -1)
  );
  ```
