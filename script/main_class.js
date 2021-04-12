(async function main() {
  const opponent = class{
    constructor(Elm_Id) {
      //const Elm_SAs = new Array;
      this.Elm_Base = document.getElementById('js_'+Elm_Id);
      this.Elm_CEgy = this.Elm_Base.getElementsByClassName('js_CEgy')[0];
      this.Elm_NAEgy = this.Elm_Base.getElementsByClassName('js_NAEgy')[0];
      this.Elm_NACnt = this.Elm_Base.getElementsByClassName('js_NACnt')[0];
      this.Elm_SAs = this.Elm_Base.getElementsByClassName('js_SAs');
      this.Elm_SATypes = this.Elm_Base.getElementsByClassName('SAType');
      this.Elm_His = this.Elm_Base.getElementsByClassName('js_history')[0];

      this.NACnt=0;  //Normal Attack Count
      this.NACnt_bfr=0;  //Normal Attack Count for Undo
      this.NAEgy=0;  //Normal Attack Energy
      this.CEgy=0;  //Charged Energy
      this.CEgy_bfr=0;  //Charged Energy for Undo
      this.SAEgy1=0; //Special Attack 1 Energy
      this.SAEgy2=0; //Special Attack 2 Energy
      this.lastMethod = 0;  //lastMethod type for undo{0:init, 1:attack_N(), 2:attack_S()}

      this.Elm_CEgy.value = this.CEgy;
      this.Elm_NAEgy.value = this.NAEgy;
      this.Elm_NACnt.value = this.NACnt;
    }


    dispError(msg){
      console.error(msg); //後でメッセージ枠を準備。共通ならGlobal関数で良さそう
    }

    selectNAEgy(){
      this.Elm_NAEgy.focus();
    }

    printStatus(){
      this.Elm_CEgy.value = this.CEgy;    //Update Charged Energy
      this.Elm_NACnt.value = this.NACnt;  //Update Normal Count

      //Update Special Attack button
      const Array_SAs = Array.from( this.Elm_SAs );
      Array_SAs.forEach( (Elm, index) => {
        const SAEgy = 35 + index*5;
        const div = Math.floor(this.Elm_CEgy.value/SAEgy);
        const diff = SAEgy - this.Elm_CEgy.value;
        if(this.Elm_NAEgy.value == '' || this.Elm_NAEgy.vales === 0){
          //array[index].value = '-回';
          Elm.value = '-回';
          this.selectNAEgy();
        } else
        if(div == 0){
          Elm.style.backgroundColor = '';
          Elm.value = Math.ceil(diff/this.Elm_NAEgy.value) + '回';
        } else{
          Elm.style.backgroundColor = 'yellow';
          const next = Math.ceil((SAEgy*(div+1) - this.Elm_CEgy.value)/this.Elm_NAEgy.value);
          Elm.value = next + '回(' + div + ')';
        }
      });

      //Update Special Attack outer boxes
      //Array化してforEachで回して、SAEgy1/2で判断したほうが良さそう。
      const Array_SATypes = Array.from( this.Elm_SATypes );
      Array_SATypes.forEach( (value, index, array) => {
        const SAIdx1 = (this.SAEgy1 - 35)/5;
        const SAIdx2 = (this.SAEgy2 - 35)/5;

        if(index == SAIdx1) array[index].style.backgroundColor = 'yellow';
        if(index == SAIdx2) array[index].style.backgroundColor = 'yellow';
      });
    }

    async printHistory(SPEgy){
      const newHist = await document.createElement("p");
      newHist.textContent = '通常技(' + this.NAEgy + '): ' + this.NACnt_bfr + '回/ゲージ技: ' + SPEgy  + '/残ゲージ: ' + this.CEgy;
      this.Elm_His.appendChild(newHist);
    }

    attack_N(){
      //put current data into bfr variable.
      this.NACnt_bfr = this.NACnt;
      this.CEgy_bfr = this.CEgy;
      this.lastMethod = 1;

      //Synch NAEgy
      this.NAEgy = this.Elm_NAEgy.value;

      //Main action
      ++this.NACnt;
      const tmpCEgy = this.NACnt * this.NAEgy;
      tmpCEgy<100?this.CEgy=tmpCEgy:this.CEgy=100;

      this.printStatus();
      return;
    }

    attack_S(Egy){
      if(this.CEgy - Egy<0){
        this.dispError('エネルギーが足りません。(10)');
        return;
      }

      //put current data into bfr variable.
      this.NACnt_bfr = this.NACnt;
      this.CEgy_bfr = this.CEgy;
      this.lastMethod = 2;  //0: init, 1: attack_N(), 2:attack_S()

      this.CEgy -= Egy;
      this.NACnt = 0;

      //Set SAEgy
      if(Egy == this.SAEgy1 || Egy == this.SAEgy2);
      else if(this.SAEgy1 == 0) this.SAEgy1 = Egy;
      else this.SAEgy2 = Egy;

      this.printStatus();
      this.printHistory(Egy);

      return;
    }

    undo(){
      this.NACnt = this.NACnt_bfr;
      this.CEgy = this.CEgy_bfr;
      //rm_object = this.Elm_His.getElementByTagName('p');
      if(this.lastMethod === 2) this.Elm_His.removeChild(this.Elm_His.lastElementChild);

      this.printStatus();
    }
    

  }

  const opp1 = new opponent('opp1');
  const opp2 = new opponent('opp2');
  const opp3 = new opponent('opp3');
  const opp = [opp1, opp2, opp3]
  let oppIndex = 0;

  function swOpps(Idx){
    oppIndex = Idx;
    opp.forEach( (value, index, array) => {
      if(index == Idx) value.Elm_Base.style.backgroundColor = '#FFF8DC';
      else value.Elm_Base.style.backgroundColor = '#BBBBBB';
    });
  }

  //UpdateStatus on change NAEgy
  const SeleNAEgy = document.getElementsByClassName('js_NAEgy');
  SeleNAEgy[0].addEventListener('change', () => opp[0].printStatus());
  SeleNAEgy[1].addEventListener('change', () => opp[1].printStatus());
  SeleNAEgy[2].addEventListener('change', () => opp[2].printStatus());

  //Key push action
  document.body.addEventListener('keydown', event => {
    //ctrl + Num: select Opp
    //a: NA
    //w: select NAEgy
    //s,d,f,g,h,x,c,v,b,n: SA
    //Z+ctrl: Undo
    if(event.key === '1' && event.ctrlKey) swOpps(0);
    else if(event.key === '2' && event.ctrlKey) swOpps(1);
    else if(event.key === '3' && event.ctrlKey) swOpps(2);
    else if(event.key === 'w') opp[oppIndex].selectNAEgy();
    else if(event.key === 'a') opp[oppIndex].attack_N();
    //attack_S
    else if(event.key === 's') opp[oppIndex].attack_S(35);
    else if(event.key === 'd') opp[oppIndex].attack_S(40);
    else if(event.key === 'f') opp[oppIndex].attack_S(45);
    else if(event.key === 'g') opp[oppIndex].attack_S(50);
    else if(event.key === 'h') opp[oppIndex].attack_S(55);
    else if(event.key === 'x') opp[oppIndex].attack_S(60);
    else if(event.key === 'c') opp[oppIndex].attack_S(65);
    else if(event.key === 'v') opp[oppIndex].attack_S(70);
    else if(event.key === 'b') opp[oppIndex].attack_S(75);
    else if(event.key === 'n') opp[oppIndex].attack_S(80);
    //end atttack_S
    else if(event.key === 'z' && event.ctrlKey) opp[oppIndex].undo();
  });


  //Mouse Click & Tap action
  opp.forEach( (OPP, index) => {
    //Switch Opponents
    OPP.Elm_Base.addEventListener( 'click', () => swOpps(index));
    //opp[1].Elm_Base.addEventListener( 'click', () => swOpps(1));
    //opp[2].Elm_Base.addEventListener( 'click', () => swOpps(2));
    //attack_N
    OPP.Elm_NACnt.addEventListener( 'click', () => { OPP.attack_N();});
    //attack_S
    const Array_SAs = Array.from( OPP.Elm_SAs );
    Array_SAs.forEach( (Elm, index) => {
      const SAEgy = 35 + index*5;
      Elm.addEventListener( 'click', () => { OPP.attack_S(SAEgy);});
    });
  });


})();
