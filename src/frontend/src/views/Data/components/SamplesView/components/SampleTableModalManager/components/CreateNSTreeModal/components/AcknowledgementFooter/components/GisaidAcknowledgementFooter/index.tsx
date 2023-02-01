import { Acknowledgements, Separator } from "./style";

export const GisaidAcknowlegementFooter = (): JSX.Element => (
  <>
    <Separator marginSize="xl" marginBottomSize="l" />
    <Acknowledgements>
      Shu, Y., McCauley, J. (2017) GISAID: From vision to reality.
      EuroSurveillance, 22(13) DOI: 10.2807/1560-7917.ES.2017.22.13.30494.
    </Acknowledgements>
  </>
);
