<template>
  <div class='row'>
    <div class='col-xs-12 main'>
      <div class='theater-heading'>
        <h1>{{title}}</h1> 
        <hr>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['title'],
};
</script>

<style scoped>
.theater-heading {
  margin: 0px 45px 0px 45px;
}

.theater-heading > h1 {
  margin-top: 35px;
  font-style: 'Open Sans', 'Helvetica Neue';
  font-size: 36px;
  color: #000000;
}

.theater-heading > hr {
  margin: 10px 0px 10px 0px;
  float: center;
  border-top: 2px solid #dedede;
  width: 780px;
}

.theater-body {
  margin: 35px 45px 0px 45px;
  text-align: center;
  font-style: 'Open Sans', 'Helvetica Neue';
  font-size: 24px;
  height: 310px;
}

.theater-body .btn {
  margin: 10px 0px 50px 0px;
  width: 145px;
  font-size: 24px;
}
</style>

