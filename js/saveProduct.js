async function saveProduct() {
  const productId = document.getElementById('product-id').value;
  const isUpdate = productId !== '';
  // Get form data
  const formData = new FormData(productForm);
  const productData = {
    name: formData.get('name'),
    description: formData.get('description'),
    price: parseFloat(formData.get('price')),
    stock: parseInt(formData.get('stock')),
    category_id: parseInt(formData.get('category_id')),
    is_featured: formData.get('is_featured') === 'on' ? 1 : 0,
    // Use formData.get('image') to get the image file
    image: formData.get('image')
  };

  if (isUpdate) {
    productData.id = productId;
  }

  // Show loading
  saveProductBtn.disabled = true;
  saveProductBtn.innerHTML = '<span class="loader-small"></span> Saving...';

  try {
    const response = await fetch('../php/api/products.php', {
      method: isUpdate ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const result = await response.json();

    if (result.success) {
      showToast(result.message || `Product ${isUpdate ? 'updated' : 'created'} successfully`, 'success');
      window.location.reload();
    } else {
      showToast(result.message || 'Failed to save product', 'error');
    }
  } catch (error) {
    console.error('Error saving product:', error);
    showToast('Failed to save product', 'error');
  } finally {
    saveProductBtn.disabled = false;
    saveProductBtn.innerHTML = isUpdate ? 'Update Product' : 'Save Product';
  }
}
