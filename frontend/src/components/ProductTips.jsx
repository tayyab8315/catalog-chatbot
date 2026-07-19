const prompts = [
  "Show me phones with the best camera under $800",
  "Compare office chairs for long work sessions",
  "What laptops are good for programming and light gaming?",
  "Find budget headphones with noise cancellation"
];

function ProductTips() {
  return (
    <section className="tips-card">
      <p className="eyebrow">Suggested Prompts</p>
      <ul className="prompt-list">
        {prompts.map((prompt) => (
          <li key={prompt}>{prompt}</li>
        ))}
      </ul>
    </section>
  );
}

export default ProductTips;
