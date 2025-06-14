<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>View Inventory</title>
  <link href="../styles.css" rel="stylesheet" />
</head>
<body>
  <div class="menu-wrapper">
    <nav class="menu-sidebar">
      <!-- same sidebar -->
    </nav>

    <main class="main-content">
      <h2>Inventory Management</h2>
      <form id="addInventoryForm">
        <input id="assetNo" placeholder="Asset No" required>
        <input id="description" placeholder="Description" required>
        <button type="submit">Add Item</button>
      </form>
      <ul id="list"></ul>
    </main>
  </div>

  <script>
    const KEY = 'testInv';
    function getItems() { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    function saveItems(it) { localStorage.setItem(KEY, JSON.stringify(it)); }
    function render() {
      document.getElementById('list').innerHTML = getItems().map(x => (`<li>${x.assetNo}: ${x.description}</li>`)).join('');
    }

    document.getElementById('addInventoryForm').addEventListener('submit', e => {
      e.preventDefault();
      let items = getItems();
      items.push({
        assetNo: document.getElementById('assetNo').value,
        description: document.getElementById('description').value
      });
      saveItems(items);
      e.target.reset();
      render();
    });

    render();
  </script>
</body>
</html>
