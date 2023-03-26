<template>
    <div>
        <p class="alert">Oi meu nome é Erick e a mensagem é: </p>
        <h1>{{ msg }}</h1>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ErickNobre',
    props: {
      msg: String
    }
  }
  </script>
  