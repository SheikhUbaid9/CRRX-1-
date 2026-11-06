const db = new Promise((resolve, reject) => {
  const request = indexedDB.open("stillroom", 1);
  request.onupgradeneeded = () =>
    request.result.createObjectStore("books", { keyPath: "id" });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
export async function booksStore(action, value) {
  const database = await db;
  return new Promise((resolve, reject) => {
    const tx = database.transaction(
      "books",
      action === "getAll" ? "readonly" : "readwrite",
    );
    const request = tx.objectStore("books")[action](value);
    let result;
    request.onsuccess = () => {
      result = request.result;
    };
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}
