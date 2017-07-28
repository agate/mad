$(function () {
  let $search = $('#search');
  let $input = $search.find('input');
  let $btn = $search.find('.btn');

  function redirect() {
    let appId = $input.val();
    window.location = `/apps${appId}`;
  }

  $btn.click(()=> redirect());
  $input.keypress(e => {
    if (e.which == 13) redirect()
  });
});
