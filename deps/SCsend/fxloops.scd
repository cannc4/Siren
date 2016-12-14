(
		~eightdels = Synth(\eightdels, [\ibs, ~emp, \defNum, ~evalNum.value]);
		~delayll = Synth(\delayll, [\ibs, ~emp2, \defNum, ~evalNum.value]);
		/*~dbecho1 = Synth.head(~gfx11, \dubecho, [\ibs,~recbus1, \defNum, ~evalNum.value]);
		~nrv2 = Synth.head(~gfx23, \nReverb, [\ibs,~recBus2, \defNum, ~evalNum.value]);
		~crv2 = Synth.head(~gfx24, \nReverb, [\ibs,~recBus2, \defNum, ~evalNum.value]);};
		~crv1 = Synth.head(~gfx14, \nReverb, [\ibs,~recBus1, \defNum, ~evalNum.value]);*/

		~modloop = Task({

			var delta;
			delta = rrand(0.1, 1) * 3;
			loop{
				delta.wait;
				b.set(0.035);

				4.do{
				~gfx11.map(\length, b);
					1.5.wait;
		};

		b.set(0.025);
		1.5.wait;

		~gfx21.map(\ibs, nil,\ofBool, 0);
		~gfx11.map(\ibs, nil,\ofBool, 0);
		3.wait;
		delta.yield;
		~gfx21.freeAll;
		0.2.wait;
		~gfx11.freeAll;
		5.wait;
}});


~mod2loop2 = Task({
	var delta = rrand(0,3);
	loop{
		~dll2 = Synth.head(~gfx22, \delayll, [\ibs,~recBus2, \defNum, ~evalNum.value]);
		delta.wait;
		~gfx22.map(\ibs, nil,\ofBool, 0);
		delta.wait;
		~dll1= Synth.head(~gfx12, \delayll, [\ibs,~recBus1, \defNum, ~evalNum.value]);
		delta.yield;
		~gfx12.freeAll;
		0.2.wait;
	}
});


~mod3loop = Task({

	var delta;
	delta = rrand(0.1, 1) * 3;
	loop{
		~nrv2 = Synth.head(~gfx23, \nReverb, [\ibs,~recBus2, \defNum, ~evalNum.value]);
		delta.wait;
		delta*4.wait;
		5.wait;
		3.do{
			~nrv1 = Synth.head(~gfx13, \nReverb, [\ibs,~recbus1, \defNum, ~evalNum.value]);};
		1.5.wait;
		1.wait;
		~gfx23.map(\ibs, nil,\ofBool, 0);
		0.9.wait;
		~gfx33.freeAll;
		5.wait;
		delta.yield;
}});
~mod4loop = Task({

	var delta;
	delta = rrand(0.1, 1) * 3;
	loop{
		~crv1 = Synth.head(~gfx14, \nReverb, [\ibs,~recBus1, \defNum, ~evalNum.value]);
		delta.wait;
		b.set(delta);

		delta.yield;
		delta*4.wait;

		10.wait;
		3.do{
			~crv2 = Synth.head(~gfx24, \nReverb, [\ibs,~recBus2, \defNum, ~evalNum.value]);};
		0.5.wait;

		1.wait;

		delta.yield;
		~gfx24.freeAll;
		0.2.wait;
		~gfx14.freeAll;
		2.wait;
}});

"/Users/canince/Documents/Github/sq/deps/SCsend/multirec.scd".load;

)
