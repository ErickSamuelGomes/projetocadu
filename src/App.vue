<template>
  <HelloWorld :msg="OI" />
  <ErickNobre :msg="OI" />
</template>

<script>
import ErickNobre from './components/ErickNobre.vue';
import HelloWorld from './components/HelloWorld.vue';


export default {
  name: 'App',
  components: {
    ErickNobre,
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
