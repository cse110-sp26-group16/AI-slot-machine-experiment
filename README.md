# AI-slot-machine-experiment

We need to run the slot machine prompt 50 times using the most advanced model available, and we need to make sure that each run is a **clean run**

Do **not** edit the code at all after running the prompt.

Commit each run as its **own folder** in the `step1/` directory and label it with its number. Example: `step1/candidate-001/`

For every run, you need to collect this data:

| Field | Notes |
| :--- | :--- |
| Run ID | e.g. `candidate-014` |
| Timestamp | ISO 8601 |
| Model + version string | exactly as reported by the tool |
| Input tokens | as reported by the harness |
| Output tokens | as reported by the harness |
| Total tokens | sum |
| Wall-clock time (s) | from your own stopwatch or tool log |
| Tool-reported time (s) | if different from wall clock |
| Files produced | count and names |
| Lines of code | total across produced files |
| Runs in browser? | yes / no / partial |
| App Quality Notes | 1-3 sentences or bullets qualitative |
| Code Quality Notes | 1-3 sentences or bullets qualitative |


Evaluate the output code based on the [rubric](RUBRIC.md). When you're done doing all your runs, note down which one was the best. The best runs will be used for the refinement step.

**Prompt:**

Create a slot machine app that uses vanilla web technology like HTML, CSS, JavaScript, and platform APIs. The slot machine should make fun of AI, as in you are winning tokens and spending tokens.

