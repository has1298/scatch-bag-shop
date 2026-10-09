
document.addEventListener('DOMContentLoaded', () => {
 
  document.querySelectorAll('form[data-autosubmit] select').forEach((select) => {
    select.addEventListener('change', () => select.form.submit());
  });

 
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!window.confirm(form.dataset.confirm)) e.preventDefault();
    });
  });

 
  document.querySelectorAll('[data-flash]').forEach((el) => {
    setTimeout(() => {
      el.style.transition = 'opacity .4s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 400);
    }, 5000);
  });

 
  document.querySelectorAll('input[type=file][data-preview]').forEach((input) => {
    const img = document.getElementById(input.dataset.preview);
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (file && img) {
        img.src = URL.createObjectURL(file);
        img.style.opacity = '1';
      }
    });
  });

 
  const form = document.querySelector('[data-product-form]');
  if (form) {
    const currency = form.dataset.currency || 'Rs.';
    const money = (n) => `${currency} ${Number(n || 0).toLocaleString('en-US')}`;
    const field = (name) => form.querySelector(`[data-bind="${name}"]`);
    const el = (name) => form.querySelector(`[data-preview-${name}]`);

    const render = () => {
      const price = Number(field('price').value) || 0;
      const discount = Math.min(Number(field('discount').value) || 0, price);

      el('name').textContent = field('name').value.trim() || 'Product name';
      el('price').textContent = money(price - discount);
      el('mrp').textContent = discount > 0 ? money(price) : '';
      el('sale').hidden = !(discount > 0);
      el('sale').textContent = `${money(discount)} off`;
      el('bg').style.backgroundColor = field('bgcolor').value;
      el('panel').style.backgroundColor = field('panelcolor').value;
      el('panel').style.color = field('textcolor').value;
    };

    form.addEventListener('input', render);
    render();
  }
});
